const path = require('path');
const markdownMagic = require('markdown-magic');
const pkgJson = require('markdown-magic-package-json');

const config = {
	transforms: {
		PKGJSON: pkgJson
	}
};

const markdownPath = path.join(__dirname, '..', 'README.md');

markdownMagic(markdownPath, config);
