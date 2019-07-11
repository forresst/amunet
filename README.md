
[filename]: # (README.md)

# amunet

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
- [Inspiration](#inspiration)
- [Installation](#installation)
- [Usage](#usage)
  * [Node.js](#nodejs)
  * [Browser](#browser)
- [Links](#links)
- [LICENSE](#license)
<!-- ⛔️ AUTO-GENERATED-CONTENT:END -->

## Inspiration

[Comment on Stackoverflow](https://stackoverflow.com/questions/4823468/comments-in-markdown/20885980#32190021)

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

console.log(amunet.readSync(path.join(__dirname, 'README.md'));
// With the 'README.md' file of this package => { filename: 'README.md' }
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

console.log(await getRemoteMetadata('https://raw.githubusercontent.com/forresst/amunet/master/README.md'));
// With the 'README.md' file of this package => { filename: 'README.md' }
```

### Browser

```js
const xhr = new XMLHttpRequest();
xhr.open('GET', 'README.md');
xhr.responseType = 'arraybuffer';

xhr.onload = () => {
	amunet.parse(new Uint8Array(this.response));
	//=> { filename: 'README.md' }
};

xhr.send();
```

## Links

http://johnmacfarlane.net/babelmark2/?text=%5Bkey1%5D%3A+%23+(value1)%0A%5Bkey2%5D%3A+%23+(value2)%0A%0A%23+Title%0A%0ASome+text%0A

- [s9e\TextFormatter](https://github.com/s9e/TextFormatter) ([Demo](https://s9e.github.io/TextFormatter/fatdown.html)): Works!
- [Parsedown](https://github.com/erusev/parsedown) ([Demo](http://parsedown.org/demo)): Works!
- [markdown-it](https://github.com/markdown-it/markdown-it) ([Demo](https://markdown-it.github.io/)): Works!

## LICENSE

<!-- ⛔️ AUTO-GENERATED-CONTENT:START (PKGJSON:template=${license}) -->
MIT
<!-- ⛔️ AUTO-GENERATED-CONTENT:END -->
