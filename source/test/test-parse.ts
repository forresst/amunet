import https from 'node:https';
import test from 'ava';
import {parse} from '../index.js';

const getRemoteMetadata = async (url: string) => new Promise((resolve, reject) => {
	https.get(url, response => {
		response.on('data', (data: string) => {
			resolve(parse(data.toString()));
		});
	}).on('error', error => {
		reject(error);
	});
});

test('The `parse` function with an empty string argument should return an empty object', t => {
	t.deepEqual(parse(''), {});
});

test('The `parse` function with a string containing one metadata argument should return an object with an element', t => {
	t.deepEqual(parse(`
[a]: # (1)`), {
		a: '1',
	});
});

test('The `parse` function with a string containing two metadatas argument should return an object with two elements', t => {
	t.deepEqual(parse(`
[a]: # (1)
[b]: # (2)`), {
		a: '1',
		b: '2',
	});
});

test('Parse function with remote file', async t => {
	t.deepEqual(await getRemoteMetadata('https://raw.githubusercontent.com/forresst/amunet/master/README.md'), {filename: 'README.md'});
});
