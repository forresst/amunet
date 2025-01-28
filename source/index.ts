import path from 'node:path';
import {readFileSync, writeFileSync} from 'node:fs';
import {readFile, writeFile} from 'node:fs/promises';
import makeDir from 'make-dir';

type Metadatas = Record<string, unknown>;

type OptionsWrite = {
	createFolderUnknown?: boolean;
	createFileUnknown?: boolean;
};

const beforeKey = '[\\t ]*\\[[\\t ]*';
const nameKey = '[^[(\\s\\])\\t]+';
const betweenKeyValue = '[\\t ]*\\]:[\\t ]*#[\\t ]+\\(';
const valueValue = '[^[(\\])\\t]+';
const afterValue = '\\)';
const checkNewLine = '[\\r\\n|\\r|\\n]?';
const regexpKeyValue = new RegExp('^' + beforeKey + '(' + nameKey + ')' + betweenKeyValue + '(' + valueValue + ')' + afterValue + '$', 'gm');
const regexpBegin = new RegExp('^' + checkNewLine + beforeKey + nameKey + betweenKeyValue + valueValue + afterValue, 'i');

/**
 * Parse metadatas from the content of a string.
 * @param input The string to parse
 * @returns A object with the metadatas (key/value pairs).
 */
const parse = (input: string): Metadatas => {
	const metas: Metadatas = {};
	if (input && input.length > 1) {
		// eslint-disable-next-line @typescript-eslint/ban-types
		let result: RegExpExecArray | null;
		while ((result = regexpKeyValue.exec(input)) !== null) {
			if (result[1] !== undefined && result[2] !== undefined) {
				metas[result[1]] = result[2];
			}
		}
	}

	return metas;
};

/**
 * Add/change/remove metadatas to a string in comment Markdown form
 *
 * **Notes**:
 *  - If a key does not exist in the `input` string and does exist in the `objectAfter` object, the key/value pair is added to the content with the value of `objectAfter`.
 *  - If a key exists in the `input` string and exists in the `objectAfter` object and the value is modified, the key/value pair is modified in the content with the value of `objectAfter`.
 *  - If a key exists in the `input` string and exists in the `objectAfter` object, and the value is not modified, the content is not modified.
 *  - If a key exists in the `input` string but does not exist in the `objectAfter` object, the key/value pair is removed.
 * @param input The Markdown content before adding metadatas
 * @param objectAfter The metadatas to add/change/remove
 * @returns The Markdown content of the result
 */
const stringify = (input: string, objectAfter: Metadatas): string => {
	const objectBefore = parse(input);
	const newLine = '\n';

	// Add metadata
	let addContent = '';
	for (const key of Object.keys(objectAfter)) {
		if (objectBefore[key] === undefined) {
			addContent += newLine + `[${key}]: # (${objectAfter[key] as string})`;
		}
	}

	let result = input;
	if (addContent !== '') {
		// To avoid to have a metadata and the file content on same line
		if (!input.startsWith(newLine)) {
			addContent += newLine;
		}

		// The file content does not begin by a metadata : we add a new line after content added
		// The goal is to separate the metadata from the rest of the content with an empty line
		if (input !== '' && !regexpBegin.test(input)) {
			addContent += newLine;
		}

		result = addContent + input;
	}

	for (const key of Object.keys(objectBefore)) {
		// Delete metadata
		if (objectAfter[key] === undefined) {
			const regexpDel = new RegExp('^' + beforeKey + key + betweenKeyValue + valueValue + afterValue + checkNewLine, 'gm');
			result = result.replace(regexpDel, '');
			continue;
		}

		// Change metadata
		if (objectBefore[key] !== objectAfter[key]) {
			const regexpChg = new RegExp('^' + beforeKey + key + betweenKeyValue + valueValue + afterValue + '$', 'gm');
			result = result.replace(regexpChg, `[${key}]: # (${objectAfter[key] as string})`,
			);
		}
	}

	return result;
};

/**
 * Asynchronous reading of a file's metadata.
 * @param filePath Path to the file to read
 * @returns A Promise of an object with the metadatas (key/value pairs).
 */
const read = async (filePath: string): Promise<Metadatas> => {
	let data = '';
	try {
		data = await readFile(filePath, 'utf8');
	} catch (error) {
		// The file doesn't exist
		if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
			return {};
		}

		throw error;
	}

	return parse(data);
};

/**
 * Synchronous reading of a file's metadata.
 * @param filePath Path to the file to read
 * @returns A object with the metadatas (key/value pairs).
 */
const readSync = (filePath: string): Metadatas => {
	let data = '';
	try {
		data = readFileSync(filePath, 'utf8');
	} catch (error) {
		// The file doesn't exist
		if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
			return {};
		}

		throw error;
	}

	return parse(data);
};

/**
 * Asynchronous writing of a file's metadata.
 * @param filePath Path to the file to write
 * @param objectAfter An object with the metadatas (key/value pairs) to add/change/remove
 * @param options.createFolderUnknown If `true`, create the folder if it doesn't exist (default: `true`)
 * @param options.createFileUnknown If `true`, create the file if it doesn't exist (default: `true`)
 * @returns The Promise is resolved when the file is written else an error is thrown
 */
const write = async (filePath: string, objectAfter: Metadatas, options?: OptionsWrite): Promise<void> => {
	const optionsDefault = {
		createFolderUnknown: true,
		createFileUnknown: true,
	};

	options = {
		...optionsDefault,
		...options,
	};

	let data = '';
	try {
		data = await readFile(filePath, 'utf8');
	} catch (error) {
		// The file doesn't exist
		if ((error as NodeJS.ErrnoException).code === 'ENOENT' && options.createFileUnknown) {
			if (options.createFolderUnknown) {
				await makeDir(path.dirname(filePath));
			}

			return writeFile(filePath, stringify('', objectAfter), 'utf8');
		}

		throw error;
	}

	return writeFile(filePath, stringify(data, objectAfter), 'utf8');
};

/**
 * Synchrone writing of a file's metadata.
 * @param filePath The path to the file to write
 * @param objectAfter An object with the metadatas (key/value pairs) to add/change/remove
 * @param options.createFolderUnknown If `true`, create the folder if it doesn't exist (default: `true`)
 * @param options.createFileUnknown If `true`, create the file if it doesn't exist (default: `true`)
 * @returns The file is written else an error is thrown
 */
const writeSync = (filePath: string, objectAfter: Metadatas, options?: OptionsWrite): void => {
	const optionsDefault = {
		createFolderUnknown: true,
		createFileUnknown: true,
	};

	options = {
		...optionsDefault,
		...options,
	};

	let data = '';
	try {
		data = readFileSync(filePath, 'utf8');
	} catch (error) {
		// The file doesn't exist
		if ((error as NodeJS.ErrnoException).code === 'ENOENT' && options.createFileUnknown) {
			if (options.createFolderUnknown) {
				makeDir.sync(path.dirname(filePath));
			}

			writeFileSync(filePath, stringify('', objectAfter), 'utf8');

			return;
		}

		throw error;
	}

	writeFileSync(filePath, stringify(data, objectAfter), 'utf8');
};

export {
	parse, read, readSync, stringify, write, writeSync,
};
