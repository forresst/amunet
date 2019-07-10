'use strict';
const {promisify} = require('util');
const fs = require('fs');

const regexpKeyValue = new RegExp(/^[\t ]*\[[\t ]*([^[(\s\])\t]+)[\t ]*\]:[\t ]*#[\t ]+\(([^[(\])\t]+)\)$/, 'gm');
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

const parse = input => {
	if (`${typeof input}` !== 'string') {
		throw new TypeError(`Expected the \`input\` argument to be of type \`String\`, got \`${typeof input}\``);
	}

	const metas = {};
	if (input && input.length > 1) {
		let result = [];
		while ((result = regexpKeyValue.exec(input)) !== null) {
			metas[result[1]] = result[2];
		}
	}

	return metas;
};

const stringify = (contentFile, objectBefore, objectAfter) => {
	if (`${typeof contentFile}` !== 'string') {
		throw new TypeError(`Expected the \`contentFile\` argument to be of type \`String\`, got \`${typeof contentFile}\``);
	}

	if (`${typeof objectBefore}` !== 'object') {
		throw new TypeError(`Expected the \`objectBefore\` argument to be of type \`Object\`, got \`${typeof objectBefore}\``);
	}

	if (`${typeof objectAfter}` !== 'object') {
		throw new TypeError(`Expected the \`objectAfter\` argument to be of type \`Object\`, got \`${typeof objectAfter}\``);
	}

	// Add metadata
	let addContent = '';
	Object.keys(objectAfter).forEach(key => {
		if (objectBefore[key] === undefined) {
			addContent += `
[${key}]: # (${objectAfter[key]})`;
		}
	});
	contentFile = addContent + contentFile;

	Object.keys(objectBefore).forEach(key => {
		// Delete metadata
		if (objectAfter[key] === undefined) {
			const regexpKey = new RegExp('^[\t ]*\\[[\t ]*' + key + '[\t ]*\\]:[\t ]*#[\t ]+\\([^[(\\])\t]+\\)[\\r\\n|\\r|\\n]?', 'gm');
			contentFile = contentFile.replace(regexpKey, '');
			return;
		}

		// Change metadata
		if (objectBefore[key] !== objectAfter[key]) {
			const regexpKey = new RegExp('^[\t ]*\\[[\t ]*' + key + '[\t ]*\\]:[\t ]*#[\t ]+\\([^[(\\])\t]+\\)$', 'gm');
			contentFile = contentFile.replace(regexpKey, `[${key}]: # (${objectAfter[key]})`
			);
		}
	});

	return contentFile;
};

const read = async filePath => new Promise((resolve, reject) => {
	readFileAsync(filePath, 'utf8', (error, data) => {
		if (error) {
			// The file doesn't exist
			if (error.code === 'ENOENT') {
				return resolve({contentFile: '', metadata: {}});
			}

			return reject(error);
		}

		return resolve({contentFile: data, metadata: parse(data)});
	});
});

const readSync = filePath => {
	try {
		const data = fs.readFileSync(filePath, 'utf8');
		return {contentFile: data, metadata: parse(data)};
	} catch (error) {
		// The file doesn't exist
		if (error.code === 'ENOENT') {
			return {contentFile: '', metadata: {}};
		}

		throw error;
	}
};

module.exports.parse = parse;

module.exports.read = read;

module.exports.readSync = readSync;

module.exports.stringify = stringify;

module.exports.write = async (filePath, objectAfter) => {
	const fileBeforeChange = await read(filePath);
	await writeFileAsync(filePath, stringify(fileBeforeChange.contentFile, fileBeforeChange.metadata, objectAfter), 'utf8');
};

module.exports.writeSync = (filePath, objectAfter) => {
	const fileBeforeChange = readSync(filePath);
	fs.writeFileSync(filePath, stringify(fileBeforeChange.contentFile, fileBeforeChange.metadata, objectAfter), 'utf8');
};
