'use strict';
const path = require('path');
const test = require('ava');
const utils = require('./_utils');
const {write} = require('..');

const outputDir = path.join(__dirname, 'fixtures', 'output', 'write-async');

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

test('Write async into new file', async t => {
	const filePath = path.join(outputDir, 'write-async-new-file.md');
	await write(filePath, {a: '1', b: '2'});
	const result = await utils.readFileAsync(filePath, 'utf8');
	t.is(result, `
[a]: # (1)
[b]: # (2)`
	);
});

test('Write async into new file in folder unknown', async t => {
	const filePath = path.join(outputDir, 'unknownFolder', 'write-async-unknown-folder.md');
	const error = await t.throwsAsync(write(filePath, {a: '1', b: '2'}));
	t.is(error.code, 'ENOENT');
});

test('Write async without change', async t => {
	const filePath = path.join(outputDir, 'write-async-already-existing.md');
	await utils.writeFileAsync(filePath, `
[a]: # (1)
[b]: # (2)

# Doc

Hello world
`
	);
	await write(filePath, {a: '1', b: '2'});
	const result = await utils.readFileAsync(filePath, 'utf8');
	t.is(result, `
[a]: # (1)
[b]: # (2)

# Doc

Hello world
`
	);
});

test('Write async with change', async t => {
	const filePath = path.join(outputDir, 'write-async-change.md');
	await utils.writeFileAsync(filePath, `
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
	await write(filePath, {a: 'async', b: 2, x: 24, d: 4, f: 'async', y: 25, h: 'async', i: 9, z: 26});
	const file = await utils.readFileAsync(filePath, 'utf8');
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
`
	);
});
