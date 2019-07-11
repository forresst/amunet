'use strict';
const test = require('ava');
const amunet = require('..');

test('The `parse` function without arguments should throw an error', t => {
	t.throws(() => {
		amunet.parse();
	}, /Expected the `input` argument to be of type `String`, got `undefined`/);
});

test('If the argument of the `parse` function is not a String it should throw an error', t => {
	t.throws(() => {
		amunet.parse({});
	}, /Expected the `input` argument to be of type `String`, got `object`/);
});

test('The `parse` function with an empty string argument should return an empty object', async t => {
	t.deepEqual(await amunet.parse(''), {});
});

test('The `parse` function with a string containing one metadata argument should return an object with an element', async t => {
	t.deepEqual(await amunet.parse(`
[a]: # (1)`
	), {
		a: '1'
	});
});

test('The `parse` function with a string containing two metadatas argument should return an object with two elements', async t => {
	t.deepEqual(await amunet.parse(`
[a]: # (1)
[b]: # (2)`
	), {
		a: '1',
		b: '2'
	});
});
