import path from 'node:path';
import test from 'ava';
import {read} from '../index.js';

const inputDirectory = path.join(import.meta.dirname, '../../source/test/fixtures');

test('Read async unknown file', async t => {
	const result = await read(path.join(inputDirectory, 'unknown.md'));
	t.deepEqual(result, {});
});

test('Read async without metadata', async t => {
	const result = await read(path.join(inputDirectory, 'without-metadata.md'));
	t.deepEqual(result, {});
});

test('Read async one metadata', async t => {
	const result = await read(path.join(inputDirectory, 'a-equal-1.md'));
	t.deepEqual(result, {a: '1'});
});

test('Read async two metadata', async t => {
	const result = await read(path.join(inputDirectory, 'two-metadata.md'));
	t.deepEqual(result, {
		a: '1',
		b: '2',
	});
});

test('Read async with metadata anywhere', async t => {
	const result = await read(path.join(inputDirectory, 'metadata-anywhere.md'));
	t.deepEqual(result, {
		a: '1',
		b: '2',
		c: '3',
		d: '4',
		e: '5',
		f: '6',
	});
});

test('Read async format pass', async t => {
	const result = await read(path.join(inputDirectory, 'format-pass.md'));
	t.deepEqual(result, {
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
		formatpass023: 'Two metadatas without empty line between `formatpass022` and `formatpass023`',
	});
});

test('Read async format fail', async t => {
	const result = await read(path.join(inputDirectory, 'format-fail.md'));
	t.deepEqual(result, {});
});
