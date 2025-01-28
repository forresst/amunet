import test from 'ava';
import {stringify} from '../index.js';

test('The `stringify` function without metadata should return a empty string', t => {
	t.is(stringify('', {}), '');
});

test('The `stringify` function with an entered string with empty `objectBefore` should return the same string', t => {
	const myString = `# Doc

Hello world
`;
	t.is(stringify(myString, {}), myString);
});

test('The `stringify` function with an entered string and `objectAfter` with one element should return a string with one metadata #1', t => {
	const myString = `# Doc

Hello world
`;
	const expectedString = `
[a]: # (1)

# Doc

Hello world
`;
	t.is(stringify(myString, {a: 1}), expectedString);
});

test('The `stringify` function with an entered string and `objectAfter` with one element should return a string with one metadata #2', t => {
	const myString = `
# Doc

Hello world
`;
	const expectedString = `
[a]: # (1)

# Doc

Hello world
`;
	t.is(stringify(myString, {a: 1}), expectedString);
});

test('The `stringify` function with an empty string and `objectAfter` with one element should return a string with one metadata', t => {
	const expectedString = `
[a]: # (1)
`;
	t.is(stringify('', {a: 1}), expectedString);
});

test('The `stringify` function with an empty string and `objectAfter` with two elements should return a string with two metadata', t => {
	const expectedString = `
[a]: # (1)
[b]: # (2)
`;
	t.is(stringify('', {a: 1, b: 2}), expectedString);
});

test('The `stringify` function with no changing of value of an already existing element', t => {
	const myString = `
[a]: # (1)

# Doc

Hello world
`;
	t.is(stringify(myString, {a: 1}), myString);
});

test('The `stringify` function with a changing of value of an already existing element', t => {
	const myString = `
[a]: # (1)

# Doc

Hello world
`;
	const expectedString = `
[a]: # (changed)

# Doc

Hello world
`;
	t.is(stringify(myString, {a: 'changed'}), expectedString);
});

test('The `stringify` function with a changing of two values of an already existing element', t => {
	const myString = `
[a]: # (1)
[b]: # (2)

# Doc

Hello world
`;
	const expectedString = `
[a]: # (changed)
[b]: # (2)

# Doc

Hello world
`;
	t.is(stringify(myString, {a: 'changed', b: 2}), expectedString);
});

test('The `stringify` function with a change of two values of an already existing element (inverted object content)', t => {
	const myString = `
[a]: # (1)
[b]: # (2)

# Doc

Hello world
`;
	const expectedString = `
[a]: # (changed)
[b]: # (2)

# Doc

Hello world
`;
	t.is(stringify(myString, {b: 2, a: 'changed'}), expectedString);
});

test('The `stringify` function with a adding of value with an already existing element # 1', t => {
	const myString = `
[a]: # (1)

# Doc

Hello world
`;
	const expectedString = `
[b]: # (added)
[a]: # (1)

# Doc

Hello world
`;
	t.is(stringify(myString, {a: 1, b: 'added'}), expectedString);
});

test('The `stringify` function with a adding of value with an already existing element # 2', t => {
	const myString = `[a]: # (1)

# Doc

Hello world
`;
	const expectedString = `
[b]: # (added)
[a]: # (1)

# Doc

Hello world
`;
	t.is(stringify(myString, {a: 1, b: 'added'}), expectedString);
});

test('The `stringify` function with a adding of two values with an already existing element', t => {
	const myString = `
[a]: # (1)

# Doc

Hello world
`;
	const expectedString = `
[c]: # (added #1)
[b]: # (added #2)
[a]: # (1)

# Doc

Hello world
`;
	t.is(stringify(myString, {c: 'added #1', a: 1, b: 'added #2'}), expectedString);
});

test('The `stringify` function with a removing of one value with an already existing element (#1)', t => {
	const myString = `
[a]: # (1)
[b]: # (2)
[c]: # (3)

# Doc

Hello world
`;
	const expectedString = `
[a]: # (1)
[c]: # (3)

# Doc

Hello world
`;
	t.is(stringify(myString, {a: 1, c: 3}), expectedString);
});

test('The `stringify` function with a removing of one value with an already existing element (#2)', t => {
	const myString = `
[a]: # (1)
[b]: # (2)

# Doc

Hello world
`;
	const expectedString = `
[a]: # (1)

# Doc

Hello world
`;
	t.is(stringify(myString, {a: 1}), expectedString);
});

test('The `stringify` function with a removing of one value with an already existing element (#3)', t => {
	const myString = `
[b]: # (2)
[a]: # (1)

# Doc

Hello world
`;
	const expectedString = `
[a]: # (1)

# Doc

Hello world
`;
	t.is(stringify(myString, {a: 1}), expectedString);
});

test('The `stringify` function with a removing of one value with an already existing element (#4)', t => {
	const myString = `
[a]: # (1)

[b]: # (2)

[c]: # (3)

# Doc

Hello world
`;
	const expectedString = `
[a]: # (1)


[c]: # (3)

# Doc

Hello world
`;
	t.is(stringify(myString, {a: 1, c: 3}), expectedString);
});

test('The `stringify` function with multiple actions', t => {
	const myString = `
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
`;
	const expectedString = `
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
`;
	t.is(stringify(myString, {
		a: 'async', b: 2, x: 24, d: 4, f: 'async', y: 25, h: 'async', i: 9, z: 26,
	}), expectedString);
});
