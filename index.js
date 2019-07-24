'use strict';
const path = require('path');
const {promisify} = require('util');
const fs = require('fs');
const makeDir = require('make-dir');

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

const read = async filePath => {
	let data = '';
	try {
		data = await readFileAsync(filePath, 'utf8');
	} catch (error) {
		// The file doesn't exist
		if (error.code === 'ENOENT') {
			return {};
		}

		throw error;
	}

	return parse(data);
};

const readSync = filePath => {
	let data = '';
	try {
		data = fs.readFileSync(filePath, 'utf8');
	} catch (error) {
		// The file doesn't exist
		if (error.code === 'ENOENT') {
			return {};
		}

		throw error;
	}

	return parse(data);
};

module.exports.parse = parse;

module.exports.read = read;

module.exports.readSync = readSync;

module.exports.stringify = stringify;

module.exports.write = async (filePath, objectAfter, options) => {
	options = {
		createFolderUnknown: true,
		createFileUnknown: true,
		...options
	};

	let data = '';
	try {
		data = await readFileAsync(filePath, 'utf8');
	} catch (error) {
		// The file doesn't exist
		if (error.code === 'ENOENT' && options.createFileUnknown === true) {
			if (options.createFolderUnknown === true) {
				await makeDir(path.dirname(filePath));
			}

			return writeFileAsync(filePath, stringify('', objectAfter), 'utf8');
		}

		throw error;
	}

	return writeFileAsync(filePath, stringify(data, objectAfter), 'utf8');
};

module.exports.writeSync = (filePath, objectAfter, options) => {
	options = {
		createFolderUnknown: true,
		createFileUnknown: true,
		...options
	};

	let data = '';
	try {
		data = fs.readFileSync(filePath, 'utf8');
	} catch (error) {
		// The file doesn't exist
		if (error.code === 'ENOENT' && options.createFileUnknown === true) {
			if (options.createFolderUnknown === true) {
				makeDir.sync(path.dirname(filePath));
			}

			return fs.writeFileSync(filePath, stringify('', objectAfter), 'utf8');
		}

		throw error;
	}

	return fs.writeFileSync(filePath, stringify(data, objectAfter), 'utf8');
};
