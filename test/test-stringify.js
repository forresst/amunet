'use strict';
const test = require('ava');
const amunet = require('..');

test('The `stringify` function without arguments should throw an error', t => {
	t.throws(() => {
		amunet.stringify();
	}, /Expected the `contentFile` argument to be of type `String`, got `undefined`/);
});

test('If the first argument of the `stringify` function is not a string, an error should be thrown', t => {
	t.throws(() => {
		amunet.stringify({});
	}, /Expected the `contentFile` argument to be of type `String`, got `object`/);
});

test('The `stringify` function with one argument should throw an error', t => {
	t.throws(() => {
		amunet.stringify('');
	}, /Expected the `objectBefore` argument to be of type `Object`, got `undefined`/);
});

test('If the second argument of the `stringify` function is not a object, an error should be thrown', t => {
	t.throws(() => {
		amunet.stringify('', '');
	}, /Expected the `objectBefore` argument to be of type `Object`, got `string`/);
});

test('The `stringify` function with two arguments should throw an error', t => {
	t.throws(() => {
		amunet.stringify('', {});
	}, /Expected the `objectAfter` argument to be of type `Object`, got `undefined`/);
});

test('If the third argument of the `stringify` function is not a object, an error should be thrown', t => {
	t.throws(() => {
		amunet.stringify('', {}, '');
	}, /Expected the `objectAfter` argument to be of type `Object`, got `string`/);
});

test('The `stringify` function without metadata should return a empty string', t => {
	t.is(amunet.stringify('', {}, {}), '');
});

test('The `stringify` function with an entered string with empty `objectBefore` and empty `objectAfter` should return the same string', t => {
	const myString = `# Doc

Hello world
`;
	t.is(amunet.stringify(myString, {}, {}), myString);
});

test('The `stringify` function with an entered string with entered `objectBefore` and empty `objectAfter` should return the same string', t => {
	const myString = `# Doc

Hello world
`;
	t.is(amunet.stringify(myString, {a: 1}, {}), myString);
});

test('The `stringify` function with an empty string, with `objectBefore` empty and `objectAfter` with one element should return a string with one metadata', t => {
	const expectedString = `
[a]: # (1)`;
	t.is(amunet.stringify('', {}, {a: 1}), expectedString);
});

test('The `stringify` function with an empty string, with `objectBefore` empty and `objectAfter` with two elements should return a string with two metadata', t => {
	const expectedString = `
[a]: # (1)
[b]: # (2)`;
	t.is(amunet.stringify('', {}, {a: 1, b: 2}), expectedString);
});

test('The `stringify` function with no changing of value of an already existing element', t => {
	const myString = `
[a]: # (1)

# Doc

Hello world
`;
	t.is(amunet.stringify(myString, {a: 1}, {a: 1}), myString);
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
	t.is(amunet.stringify(myString, {a: 1}, {a: 'changed'}), expectedString);
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
	t.is(amunet.stringify(myString, {a: 1, b: 2}, {a: 'changed', b: 2}), expectedString);
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
	t.is(amunet.stringify(myString, {a: 1, b: 2}, {b: 2, a: 'changed'}), expectedString);
});

test('The `stringify` function with a adding of value with an already existing element', t => {
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
	t.is(amunet.stringify(myString, {a: 1}, {a: 1, b: 'added'}), expectedString);
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
	t.is(amunet.stringify(myString, {a: 1}, {c: 'added #1', a: 1, b: 'added #2'}), expectedString);
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
	t.is(amunet.stringify(myString, {a: 1, b: 2, c: 3}, {a: 1, c: 3}), expectedString);
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
	t.is(amunet.stringify(myString, {a: 1, b: 2}, {a: 1}), expectedString);
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
	t.is(amunet.stringify(myString, {a: 1, b: 2}, {a: 1}), expectedString);
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
	t.is(amunet.stringify(myString, {a: 1, b: 2, c: 3}, {a: 1, c: 3}), expectedString);
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
	t.is(amunet.stringify(myString, {a: 1, b: 2, c: 3, d: 4, e: 5, f: 6, g: 7, h: 8, i: 9}, {a: 'async', b: 2, x: 24, d: 4, f: 'async', y: 25, h: 'async', i: 9, z: 26}), expectedString);
});

