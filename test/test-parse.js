'use strict';
const https = require('https');
const test = require('ava');
const {parse} = require('..');

const getRemoteMetadata = url => new Promise((resolve, reject) => {
	https.get(url, resp => {
		resp.once('data', buffer => {
			resp.destroy();
			resolve(parse(buffer.toString('utf8')));
		});
	}).on('error', error => {
		reject(error);
	});
});

test('The `parse` function without arguments should throw an error', t => {
	t.throws(() => {
		parse();
	}, {
		instanceOf: TypeError,
		message: 'Expected the `input` argument to be of type `String`, got `undefined`'
	});
});

test('If the argument of the `parse` function is not a String it should throw an error', t => {
	t.throws(() => {
		parse({});
	}, {
		instanceOf: TypeError,
		message: 'Expected the `input` argument to be of type `String`, got `object`'
	});
});

test('The `parse` function with an empty string argument should return an empty object', async t => {
	t.deepEqual(await parse(''), {});
});

test('The `parse` function with a string containing one metadata argument should return an object with an element', async t => {
	t.deepEqual(await parse(`
[a]: # (1)`
	), {
		a: '1'
	});
});

test('The `parse` function with a string containing two metadatas argument should return an object with two elements', async t => {
	t.deepEqual(await parse(`
[a]: # (1)
[b]: # (2)`
	), {
		a: '1',
		b: '2'
	});
});

test('Parse function with remote file', async t => {
	t.deepEqual(await getRemoteMetadata('https://raw.githubusercontent.com/forresst/amunet/master/README.md'), {filename: 'README.md'});
});
