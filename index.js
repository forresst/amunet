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

const stringify = (input, objectAfter) => {
	if (`${typeof input}` !== 'string') {
		throw new TypeError(`Expected the \`input\` argument to be of type \`String\`, got \`${typeof input}\``);
	}

	if (`${typeof objectAfter}` !== 'object') {
		throw new TypeError(`Expected the \`objectAfter\` argument to be of type \`Object\`, got \`${typeof objectAfter}\``);
	}

	const objectBefore = parse(input);

	// Add metadata
	let addContent = '';
	Object.keys(objectAfter).forEach(key => {
		if (objectBefore[key] === undefined) {
			addContent += `
[${key}]: # (${objectAfter[key]})`;
		}
	});
	let result = addContent + input;

	Object.keys(objectBefore).forEach(key => {
		// Delete metadata
		if (objectAfter[key] === undefined) {
			const regexpKey = new RegExp('^[\t ]*\\[[\t ]*' + key + '[\t ]*\\]:[\t ]*#[\t ]+\\([^[(\\])\t]+\\)[\\r\\n|\\r|\\n]?', 'gm');
			result = result.replace(regexpKey, '');
			return;
		}

		// Change metadata
		if (objectBefore[key] !== objectAfter[key]) {
			const regexpKey = new RegExp('^[\t ]*\\[[\t ]*' + key + '[\t ]*\\]:[\t ]*#[\t ]+\\([^[(\\])\t]+\\)$', 'gm');
			result = result.replace(regexpKey, `[${key}]: # (${objectAfter[key]})`
			);
		}
	});

	return result;
};

const read = async filePath => new Promise((resolve, reject) => {
	readFileAsync(filePath, 'utf8', (error, data) => {
		if (error) {
			// The file doesn't exist
			if (error.code === 'ENOENT') {
				return resolve({});
			}

			return reject(error);
		}

		return resolve(parse(data));
	});
});

const readSync = filePath => {
	try {
		const data = fs.readFileSync(filePath, 'utf8');
		return parse(data);
	} catch (error) {
		// The file doesn't exist
		if (error.code === 'ENOENT') {
			return {};
		}

		throw error;
	}
};

module.exports.parse = parse;

module.exports.read = read;

module.exports.readSync = readSync;

module.exports.stringify = stringify;

module.exports.write = async (filePath, objectAfter) => new Promise((resolve, reject) => {
	readFileAsync(filePath, 'utf8', (error, data) => {
		if (error) {
			// The file doesn't exist
			if (error.code === 'ENOENT') {
				return resolve(writeFileAsync(filePath, stringify('', objectAfter), 'utf8'));
			}

			return reject(error);
		}

		return resolve(writeFileAsync(filePath, stringify(data, objectAfter), 'utf8'));
	});
});

module.exports.writeSync = (filePath, objectAfter) => {
	try {
		const data = fs.readFileSync(filePath, 'utf8');
		return fs.writeFileSync(filePath, stringify(data, objectAfter), 'utf8');
	} catch (error) {
		// The file doesn't exist
		if (error.code === 'ENOENT') {
			return fs.writeFileSync(filePath, stringify('', objectAfter), 'utf8');
		}

		throw error;
	}
};
