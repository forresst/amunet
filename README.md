
[filename]: # (README.md)

# Amunet

Amunet : markdown metadata hidden

[![Travis Build Status](https://travis-ci.org/forresst/amunet.svg?branch=master)](https://travis-ci.org/forresst/amunet)
[![AppVeyor Build status](https://ci.appveyor.com/api/projects/status/4movr98t9uephfyg?svg=true)](https://ci.appveyor.com/project/forresst/amunet)
[![Coverage Status](https://coveralls.io/repos/github/forresst/amunet/badge.svg)](https://coveralls.io/github/forresst/amunet)
[![version](https://img.shields.io/npm/v/amunet.svg?style=flat-square)](https://www.npmjs.com/package/amunet)
[![node-version](https://img.shields.io/badge/node-%3E%3D%208.0-orange.svg?style=flat-square)](https://nodejs.org)
[![downloads](https://img.shields.io/npm/dm/amunet.svg?style=flat-square)](http://npm-stat.com/charts.html?package=amunet)

[![MIT License](https://img.shields.io/npm/l/amunet.svg?style=flat-square)](https://github.com/forresst/amunet/blob/master/LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![Code of Conduct](https://img.shields.io/badge/code%20of-conduct-ff69b4.svg?style=flat-square)](https://github.com/forresst/amunet/blob/master/CODE_OF_CONDUCT.md)
[![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/xojs/xo)

[![Watch on GitHub](https://img.shields.io/github/watchers/forresst/amunet.svg?style=social)](https://github.com/forresst/amunet/watchers)
[![Star on GitHub](https://img.shields.io/github/stars/forresst/amunet.svg?style=social)](https://github.com/forresst/amunet/stargazers)

## Table of Contents

<!-- ⛔️ AUTO-GENERATED-CONTENT:START (TOC) -->
- [The goal](#the-goal)
- [Installation](#installation)
- [Usage](#usage)
  * [Node.js](#nodejs)
- [API](#api)
  * [amunet.parse(input)](#amunetparseinput)
    + [input](#input)
    + [return](#return)
    + [Example](#example)
  * [amunet.stringify(input, objectAfter)](#amunetstringifyinput-objectafter)
    + [input](#input-1)
    + [objectAfter](#objectafter)
    + [return](#return-1)
    + [Example](#example-1)
  * [amunet.read(filePath)](#amunetreadfilepath)
    + [filePath](#filepath)
    + [return](#return-2)
    + [Example](#example-2)
  * [amunet.readSync(filePath)](#amunetreadsyncfilepath)
    + [filePath](#filepath-1)
    + [return](#return-3)
    + [Example](#example-3)
  * [amunet.write(filePath, objectAfter, options?)](#amunetwritefilepath-objectafter-options)
    + [filePath](#filepath-2)
    + [objectAfter](#objectafter-1)
    + [options](#options)
    + [return](#return-4)
    + [Example](#example-4)
  * [amunet.writeSync(filePath, objectAfter, options?)](#amunetwritesyncfilepath-objectafter-options)
    + [filePath](#filepath-3)
    + [objectAfter](#objectafter-2)
    + [options](#options-1)
    + [return](#return-5)
    + [Example](#example-5)
- [LICENSE](#license)
<!-- ⛔️ AUTO-GENERATED-CONTENT:END -->

## The goal

The goal is to embed invisible metadata in a Markdown file when this file will be rendered on a web page, for example under Github.

There is a solution that is described on [Stackoverflow](https://stackoverflow.com/questions/4823468/comments-in-markdown/20885980#32190021) to add comments that will be invisible when rendering. To summarize, the following syntax allows you to include comments that will not be rendered on an HTML page:

```txt

[comment]: # (Hello world)

```

In general, this approach should work with most Markdown parsers, since it's part of the core specification.

The complementary idea for adding metadata is to produce the metadata as key/value pairs. Just place the key between the brackets, and the value between the parentheses:

```txt

[key1]: # (value1)
[key2]: # (value2)
[a]: # (1)
[foo] # (bar)

```

Amunet is the tool to parse and produce this concept easily in your Markdown files.

## Installation

This module is distributed via [npm](https://www.npmjs.com/) which is bundled with [node](https://nodejs.org) and should be installed as one of your project's `devDependencies`:

```console
npm install --save-dev amunet
```

## Usage

### Node.js

```js
const path = require('path');
const amunet = require('amunet');

// ----------------------------
// Read the file synchronously
// ----------------------------
const file = amunet.readSync(path.join(__dirname, 'README.md'));
console.log(file.metadata);
//=> With the 'README.md' file of this package => { filename: 'README.md' }

// -----------------------------
// Read the file asynchronously
// -----------------------------
(async () => {
	const fileSync = await amunet.read(path.join(__dirname, 'README.md'));
	console.log(fileSync.metadata);
	// With the 'README.md' file of this package => { filename: 'README.md' }
})();
```

Or from a remote location:

```js
const https = require('https');
const amunet = require('amunet');

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

(async () => {
	console.log(await getRemoteMetadata('https://raw.githubusercontent.com/forresst/amunet/master/README.md'));
	// With the 'README.md' file of this package => { filename: 'README.md' }
})();
```

## API

### amunet.parse(input)

Parse the content of the string. Returns a `object` with the metadata (key/value pairs).

#### input

Type: `string`

The string to parse.

#### return

Type: `object`

The object with the metadata as key\value pairs.

> Note: If the string does not contain metadata, the function returns an empty object.

#### Example

`index.js`:
> ```javascript
>
> const amunet = require('amunet');
>
> const inputString = `
> [a]: # (1)
> [b]: # (Hello)
>
> # Doc
>
> Hello world
> `
>
> console.log(amunet.parse(inputString));
> //=> { a: '1', b: 'Hello' }
> ```

### amunet.stringify(input, objectAfter)

Add/change/remove the content of the `input` string with the object `objectAfter`. Returns a `string` with the modified content.

> Notes:
> * If a key does not exist in the `input` string and exists in object `objectAfter`, the key/value pair is appended to the content with the value of `objectAfter`.
> * If a key exists in the `input` string and exists in object `objectAfter` and the value is changed, the key/value pair is changed in the content with the value of `objectAfter`.
> * If a key exists in the `input` string and exists in object `objectAfter` and the value is not changed, the content is not changed.
> * If a key exists in the `input` string but does not exist in object `objectAfter`, the key/value pair is removed.

#### input

Type: `string`

The string to stringify.

#### objectAfter

Type: `object`

The object with all metadata as key\value pairs.

#### return

Type: `string`

The string with the content changed.

#### Example

`index.js`:
> ```javascript
>
> const amunet = require('amunet');
>
> const inputString = `
> [a]: # (1)
> [b]: # (Hello)
> [c]: # (3)
>
> # Doc
>
> Hello world
> `
>
> console.log(amunet.stringify(inputString, { a: '1', b: 'World', d: '4' }));
> //=> `
> // [d]: # (4)
> // [a]: # (1)
> // [b]: # (World)
> //
> // # Doc
> //
> // Hello world
> // `
> ```

### amunet.read(filePath)

Read asynchronously a file and parse its content. Returns a `Promise<object>` with the parsed metadata of the specified file (`filePath`).

#### filePath

Type: `string`

#### return

Type: `Promise<object>`

The object contains the metadata as key\value pairs found in the specified file.

>Notes:
> * If the file does not exist, the function returns an empty object.
> * If the file does not contain metadata, the function returns an empty object.

#### Example

`README.md`:
> ```txt
>
> [a]: # (1)
> [b]: # (Hello)
>
> # Doc
>
> Hello world
> ```

`index.js`:
> ```javascript
>
> const path = require('path');
> const amunet = require('amunet');
>
> (async () => {
> 	const fileAsync = await amunet.read(path.join(__dirname, 'README.md'));
> 	console.log(fileAsync);
> 	//=> { a: '1', b: 'Hello' }
> })();
> ```

### amunet.readSync(filePath)

Read synchronously a file and parse its content. Returns a `object` with the parsed metadata of the specified file (`filePath`).

#### filePath

Type: `string`

#### return

Type: `object`

The object contains the metadata as key\value pairs found in the specified file.

>Notes:
> * If the file does not exist, the function returns an empty object.
> * If the file does not contain metadata, the function returns an empty object.

#### Example

`README.md`:
> ```txt
>
> [a]: # (1)
> [b]: # (Hello)
>
> # Doc
>
> Hello world
> ```

`index.js`:
> ```javascript
>
> const path = require('path');
> const amunet = require('amunet');
>
> const fileSync = amunet.readSync(path.join(__dirname, 'README.md'));
> console.log(fileSync);
> //=> { a: '1', b: 'Hello' }
> ```

### amunet.write(filePath, objectAfter, options?)

Write asynchronously a file (`filePath`) and change its content with object `objectAfter`.

#### filePath

Type: `string`

#### objectAfter

Type: `object`

The object with all metadata as key\value pairs.

#### options

Type: `object`

- createFolderUnknown: create the folder of the file if the folder does not exist
  * Type: `boolean`
	* Default: `true`
- createFileUnknown: create the file if the file does not exist
  * Type: `boolean`
	* Default: `true`

#### return

Type: `Promise`

#### Example

`README.md`:
> ```txt
>
> [a]: # (1)
> [b]: # (Hello)
> [c]: # (3)
>
> # Doc
>
> Hello world
> ```

`index.js`:
> ```javascript
>
> const path = require('path');
> const amunet = require('amunet');
>
> (async () => {
> 	await amunet.write(path.join(__dirname, 'README.md'), { a: '1', b: 'World', d: '4' });
> 	//=> new content of README.md:
> 	// [d]: # (4)
> 	// [a]: # (1)
> 	// [b]: # (World)
> 	//
> 	// # Doc
> 	//
> 	// Hello world
> })();
> ```

### amunet.writeSync(filePath, objectAfter, options?)

Write synchronously a file (`filePath`) and change its content with object `objectAfter`.

#### filePath

Type: `string`

#### objectAfter

Type: `object`

The object with all metadata as key\value pairs.

#### options

Type: `object`

- createFolderUnknown: create the folder of the file if the folder does not exist
  * Type: `boolean`
	* Default: `true`
- createFileUnknown: create the file if the file does not exist
  * Type: `boolean`
	* Default: `true`

#### return

Nothing

#### Example

`README.md`:
> ```txt
>
> [a]: # (1)
> [b]: # (Hello)
> [c]: # (3)
>
> # Doc
>
> Hello world
> ```

`index.js`:
> ```javascript
>
> const path = require('path');
> const amunet = require('amunet');
>
> amunet.writeSync(path.join(__dirname, 'README.md'), { a: '1', b: 'World', d: '4' });
> //=> new content of README.md:
> // [d]: # (4)
> // [a]: # (1)
> // [b]: # (World)
> //
> // # Doc
> //
> // Hello world
> ```

## LICENSE

<!-- ⛔️ AUTO-GENERATED-CONTENT:START (PKGJSON:template=${license}) -->
MIT
<!-- ⛔️ AUTO-GENERATED-CONTENT:END -->
