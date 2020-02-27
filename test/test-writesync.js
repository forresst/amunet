'use strict';
const path = require('path');
const fs = require('fs');
const test = require('ava');
const utils = require('./_utils');
const {writeSync} = require('..');

const outputDir = path.join(__dirname, 'fixtures', 'output', 'write-sync');

// Removing output test files before all tests
test.before.cb('Cleanup', t => {
	utils.deleteContentFolderRecursiveSync(outputDir);
	t.end();
});

// Removing output test files after all tests
test.after.cb('Cleanup', t => {
	utils.deleteContentFolderRecursiveSync(outputDir);
	t.end();
});

test('Write sync into new file with createFileUnknown by default', t => {
	const filePath = path.join(outputDir, 'write-sync-new-file-option-default.md');
	writeSync(filePath, {a: '1', b: '2'});
	const result = fs.readFileSync(filePath, 'utf8');
	t.is(result, `
[a]: # (1)
[b]: # (2)
`
	);
});

test('Write sync into new file with createFileUnknown: false', t => {
	const filePath = path.join(outputDir, 'write-sync-new-file-option-false.md');
	const error = t.throws(() => {
		writeSync(filePath, {a: '1', b: '2'}, {createFileUnknown: false});
	}, {
		instanceOf: Error
	});
	t.is(error.code, 'ENOENT');
});

test('Write sync into new file in folder unknown with createFolderUnknown by default', t => {
	const filePath = path.join(outputDir, 'unknownFolder', 'write-sync-unknown-folder-option-default.md');
	writeSync(filePath, {a: '1', b: '2'});
	const result = fs.readFileSync(filePath, 'utf8');
	t.is(result, `
[a]: # (1)
[b]: # (2)
`
	);
});

test('Write sync into new file in folder unknown with createFolderUnknown: false', t => {
	const filePath = path.join(outputDir, 'unknownFolder2', 'write-sync-unknown-folder-option-false.md');
	const error = t.throws(() => {
		writeSync(filePath, {a: '1', b: '2'}, {createFolderUnknown: false});
	}, {
		instanceOf: Error
	});
	t.is(error.code, 'ENOENT');
});

test('Write sync into new file in folder unknown with createFolderUnknown: false, createFileUnknown: false', t => {
	const filePath = path.join(outputDir, 'unknownFolder3', 'write-sync-unknown-folder-option-all-false.md');
	const error = t.throws(() => {
		writeSync(filePath, {a: '1', b: '2'}, {createFolderUnknown: false, createFileUnknown: false});
	}, {
		instanceOf: Error
	});
	t.is(error.code, 'ENOENT');
});

test('Write sync without change', t => {
	const filePath = path.join(outputDir, 'write-sync-already-existing.md');
	fs.writeFileSync(filePath, `
[a]: # (1)
[b]: # (2)

# Doc

Hello world
`
	);
	writeSync(filePath, {a: 1, b: 2});
	const result = fs.readFileSync(filePath, 'utf8');
	t.is(result, `
[a]: # (1)
[b]: # (2)

# Doc

Hello world
`
	);
});

test('Write sync with change', t => {
	const filePath = path.join(outputDir, 'write-sync-change.md');
	fs.writeFileSync(filePath, `
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
	writeSync(filePath, {a: 'sync', b: 2, x: 24, d: 4, f: 'sync', y: 25, h: 'sync', i: 9, z: 26});
	const file = fs.readFileSync(filePath, 'utf8');
	t.is(file, `
[x]: # (24)
[y]: # (25)
[z]: # (26)
[a]: # (sync)
[b]: # (2)

[d]: # (4)


[f]: # (sync)

[h]: # (sync)
[i]: # (9)

# Doc

Hello world
`
	);
});
