'use strict';
const path = require('path');
const {promisify} = require('util');
const fs = require('fs');
const makeDir = require('make-dir');

const beforeKey = '[\\t ]*\\[[\\t ]*';
const nameKey = '[^[(\\s\\])\\t]+';
const betweenKeyValue = '[\\t ]*\\]:[\\t ]*#[\\t ]+\\(';
const valValue = '[^[(\\])\\t]+';
const afterValue = '\\)';
const checkNewLine = '[\\r\\n|\\r|\\n]?';
const regexpKeyValue = new RegExp('^' + beforeKey + '(' + nameKey + ')' + betweenKeyValue + '(' + valValue + ')' + afterValue + '$', 'gm');
const regexpBegin = new RegExp('^' + checkNewLine + beforeKey + nameKey + betweenKeyValue + valValue + afterValue, 'i');

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
	const newLine = '\n';

	// Add metadata
	let addContent = '';
	Object.keys(objectAfter).forEach(key => {
		if (objectBefore[key] === undefined) {
			addContent += newLine + `[${key}]: # (${objectAfter[key]})`;
		}
	});
	let result = input;
	if (addContent !== '') {
		// To avoid to have a metadata and the file content on same line
		if (input.slice(0, 1) !== newLine) {
			addContent += newLine;
		}

		// The file content does not begin by a metadata : we add a new line after content added
		// The goal is to separate the metadata from the rest of the content with an empty line
		if (input !== '' && !input.match(regexpBegin)) {
			addContent += newLine;
		}

		result = addContent + input;
	}

	Object.keys(objectBefore).forEach(key => {
		// Delete metadata
		if (objectAfter[key] === undefined) {
			const regexpDel = new RegExp('^' + beforeKey + key + betweenKeyValue + valValue + afterValue + checkNewLine, 'gm');
			result = result.replace(regexpDel, '');
			return;
		}

		// Change metadata
		if (objectBefore[key] !== objectAfter[key]) {
			const regexpChg = new RegExp('^' + beforeKey + key + betweenKeyValue + valValue + afterValue + '$', 'gm');
			result = result.replace(regexpChg, `[${key}]: # (${objectAfter[key]})`
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
