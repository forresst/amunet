'use strict';
const fs = require('fs');
const path = require('path');
const {promisify} = require('util');

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

module.exports.deleteContentFolderRecursiveSync = deleteContentFolderRecursiveSync;

module.exports.readFileAsync = promisify(fs.readFile);
module.exports.writeFileAsync = promisify(fs.writeFile);
