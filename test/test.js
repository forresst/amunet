'use strict';
const path = require('path');
const https = require('https');
const {promisify} = require('util');
const fs = require('fs');
const test = require('ava');
const amunet = require('..');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);

const getLocalMetadata = async filenamemarkdown => {
	const result = await amunet.read(
		path.join(__dirname, 'fixtures', `${filenamemarkdown}.md`)
	);
	return result;
};

const deleteContentFolderRecursiveSync = pathFolder => {
	if (fs.existsSync(pathFolder)) {
		fs.readdirSync(pathFolder).forEach(file => {
			if (file === '.gitignore') {
				return;
			}

			const curPath = path.join(pathFolder, file);
			if (fs.lstatSync(curPath).isDirectory()) {
				deleteContentFolderRecursiveSync(curPath);
			} else {
				fs.unlinkSync(curPath);
			}
		});
	}
};

const getRemoteMetadata = url => new Promise((resolve, reject) => {
	https.get(url, resp => {
		resp.once('data', buffer => {
			resp.destroy();
			resolve(amunet.parse(buffer.toString('utf8')));
		});
	}).on('error', error => {
		reject(error);
	});
});

const outputDir = path.join(__dirname, 'fixtures', 'output');

// Removing output test files before all tests
test.before.cb('Cleanup', t => {
	deleteContentFolderRecursiveSync(outputDir);
	t.end();
});

// Removing output test files after all tests
test.after.cb('Cleanup', t => {
	deleteContentFolderRecursiveSync(outputDir);
	t.end();
});

test('Read async', async t => {
	const result = await amunet.read(path.join(__dirname, 'fixtures', 'two-metadata.md'));
	t.deepEqual(result, {
		a: '1',
		b: '2'
	});
});

test('Read sync', t => {
	const result = amunet.readSync(path.join(__dirname, 'fixtures', 'two-metadata.md'));
	t.deepEqual(result, {
		a: '1',
		b: '2'
	});
});

test('Read async unknown file', async t => {
	const result = await amunet.read(path.join(__dirname, 'fixtures', 'unknown.md'));
	t.deepEqual(result, {});
});

test('Read sync unknown file', t => {
	const result = amunet.readSync(path.join(__dirname, 'fixtures', 'unknown.md'));
	t.deepEqual(result, {});
});

test('Read without metadata', async t => {
	t.deepEqual(await getLocalMetadata('without-metadata'), {});
});

test('Read one metadata', async t => {
	t.deepEqual(await getLocalMetadata('a-equal-1'), {
		a: '1'
	});
});

test('Read two metadata', async t => {
	t.deepEqual(await getLocalMetadata('two-metadata'), {
		a: '1',
		b: '2'
	});
});

test('Read remote', async t => {
	t.deepEqual(await getRemoteMetadata('https://raw.githubusercontent.com/forresst/amunet/master/README.md'), {filename: 'README.md'});
});

test('Read with metadata anywhere', async t => {
	t.deepEqual(await getLocalMetadata('metadata-anywhere'), {
		a: '1',
		b: '2',
		c: '3',
		d: '4',
		e: '5',
		f: '6'
	});
});

test('Read format pass', async t => {
	t.deepEqual(await getLocalMetadata('format-pass'), {
		formatpass001: 'The best format',
		formatpass002: 'With a space between `open bracket` and `formatpass002`',
		formatpass003: 'With a space between `formatpass003` and `closed bracket`',
		formatpass004: 'With a space on each side of `formatpass004`',
		formatpass005: 'With many spaces between `open bracket` and `formatpass005`',
		formatpass006: 'With many spaces between `formatpass006` and `closed bracket`',
		formatpass007: 'With many spaces on each side of `formatpass007`',
		formatpass008: 'With a tab between `open bracket` and `formatpass008`',
		formatpass009: 'With a tab between `formatpass009` and `closed bracket`',
		formatpass010: 'With a tab on each side of `formatpass010`',
		formatpass011: 'With many tabs between `open bracket` and `formatpass011`',
		formatpass012: 'With many tabs between `formatpass012` and `closed bracket`',
		formatpass013: 'With many tabs on each side of `formatpass013`',
		formatpass014: 'With a space before `open bracket`',
		formatpass015: 'With many spaces before `open bracket`',
		formatpass016: 'With no space between `closed bracket` and `pound sign`',
		formatpass017: 'With many spaces between `colon` and `pound sign`',
		formatpass018: 'With many spaces between `pound sign` and `open parenthesis`',
		formatpass019: 'With a tab between `colon` and `pound sign`',
		formatpass020: 'With a tab between `pound sign` and `open parenthesis`',
		formatpass021: 'This comment will be taken because it will overwrite the metadata `formatpass021` of the previous line',
		formatpass022: 'Two metadatas without empty line between `formatpass022` and `formatpass023`',
		formatpass023: 'Two metadatas without empty line between `formatpass022` and `formatpass023`'
	});
});

test('Read format fail', async t => {
	t.deepEqual(await getLocalMetadata('format-fail'), {});
});

test('Write async into new file', async t => {
	const filePath = path.join(outputDir, 'write-async-new-file.md');
	await amunet.write(filePath, {a: '1', b: '2'});
	const result = await readFileAsync(filePath, 'utf8');
	t.is(result, `
[a]: # (1)
[b]: # (2)`
	);
});

test('Write sync into new file', t => {
	const filePath = path.join(outputDir, 'write-sync-new-file.md');
	amunet.writeSync(filePath, {a: '1', b: '2'});
	const result = fs.readFileSync(filePath, 'utf8');
	t.is(result, `
[a]: # (1)
[b]: # (2)`
	);
});

test('Write async into new file in folder unknown', async t => {
	const filePath = path.join(outputDir, 'unknownFolder', 'write-async-unknown-folder.md');
	const error = await t.throwsAsync(amunet.write(filePath, {a: '1', b: '2'}));
	t.is(error.code, 'ENOENT');
});

test('Write sync into new file in folder unknown', t => {
	const filePath = path.join(outputDir, 'unknownFolder', 'write-sync-unknown-folder.md');
	const error = t.throws(() => {
		amunet.writeSync(filePath, {a: '1', b: '2'});
	}, Error);
	t.is(error.code, 'ENOENT');
});

test('Write async without change', async t => {
	const filePath = path.join(outputDir, 'write-async-already-existing.md');
	await writeFileAsync(filePath, `
[a]: # (1)
[b]: # (2)

# Doc

Hello world
`
	);
	await amunet.write(filePath, {a: '1', b: '2'});
	const result = await readFileAsync(filePath, 'utf8');
	t.is(result, `
[a]: # (1)
[b]: # (2)

# Doc

Hello world
`
	);
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
	amunet.writeSync(filePath, {a: 1, b: 2});
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
	amunet.writeSync(filePath, {a: 'sync', b: 2, x: 24, d: 4, f: 'sync', y: 25, h: 'sync', i: 9, z: 26});
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

test('Write async with change', async t => {
	const filePath = path.join(outputDir, 'write-async-change.md');
	await writeFileAsync(filePath, `
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
	await amunet.write(filePath, {a: 'async', b: 2, x: 24, d: 4, f: 'async', y: 25, h: 'async', i: 9, z: 26});
	const file = await readFileAsync(filePath, 'utf8');
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
