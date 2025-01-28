import path from 'node:path';
import process from 'node:process';
import {readFile, writeFile} from 'node:fs/promises';
import test from 'ava';
import {write} from '../index.js';
import {deleteContentFolderRecursiveSync} from './_utils.js';

const outputDirectory = path.join(process.cwd(), 'source/test/fixtures/output/write-async');

// Removing output test files before all tests
test.before('Cleanup', () => {
	deleteContentFolderRecursiveSync(outputDirectory);
});

// Removing output test files after all tests
test.after('Cleanup', () => {
	deleteContentFolderRecursiveSync(outputDirectory);
});

test('Write async into new file with createFileUnknown by default', async t => {
	const filePath = path.join(outputDirectory, 'write-async-new-file-option-default.md');
	await write(filePath, {a: '1', b: '2'});
	const result = await readFile(filePath, 'utf8');
	t.is(result, `
[a]: # (1)
[b]: # (2)
`,
	);
});

test('Write async into new file with createFileUnknown: false', async t => {
	const filePath = path.join(outputDirectory, 'write-async-new-file-option-false.md');
	await t.throwsAsync(write(filePath, {a: '1', b: '2'}, {createFileUnknown: false}), {any: true, message: /ENOENT/});
});

test('Write async into new file in folder unknown with createFolderUnknown by default', async t => {
	const filePath = path.join(outputDirectory, 'unknownFolder', 'write-async-unknown-folder-option-default.md');
	await write(filePath, {a: '1', b: '2'});
	const result = await readFile(filePath, 'utf8');
	t.is(result, `
[a]: # (1)
[b]: # (2)
`,
	);
});

test('Write async into new file in folder unknown with createFolderUnknown: false', async t => {
	const filePath = path.join(outputDirectory, 'unknownFolder2', 'write-async-unknown-folder-option-false.md');
	await t.throwsAsync(write(filePath, {a: '1', b: '2'}, {createFolderUnknown: false}), {any: true, message: /ENOENT/});
});

test('Write async into new file in folder unknown with createFolderUnknown: false, createFileUnknown: false', async t => {
	const filePath = path.join(outputDirectory, 'unknownFolder3', 'write-async-unknown-folder-option-all-false.md');
	await t.throwsAsync(write(filePath, {a: '1', b: '2'}, {createFolderUnknown: false, createFileUnknown: false}), {any: true, message: /ENOENT/});
});

test('Write async without change', async t => {
	const filePath = path.join(outputDirectory, 'write-async-already-existing.md');
	await writeFile(filePath, `
[a]: # (1)
[b]: # (2)

# Doc

Hello world
`,
	);
	await write(filePath, {a: '1', b: '2'});
	const result = await readFile(filePath, 'utf8');
	t.is(result, `
[a]: # (1)
[b]: # (2)

# Doc

Hello world
`,
	);
});

test('Write async with change', async t => {
	const filePath = path.join(outputDirectory, 'write-async-change.md');
	await writeFile(filePath, `
[a]: # (1)
[b]: # (2)
[c]: # (3)

[d]: # (4)

[e]: # (5)

[f]: # (6)

[g]: # (7)
[h]: # (8)
[i]: # (9)

# Doc

Hello world
`, 'utf8');
	await write(filePath, {
		a: 'async', b: 2, x: 24, d: 4, f: 'async', y: 25, h: 'async', i: 9, z: 26,
	});
	const file = await readFile(filePath, 'utf8');
	t.is(file, `
[x]: # (24)
[y]: # (25)
[z]: # (26)
[a]: # (async)
[b]: # (2)

[d]: # (4)


[f]: # (async)

[h]: # (async)
[i]: # (9)

# Doc

Hello world
`,
	);
});
