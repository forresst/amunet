import fs from 'node:fs';
import path from 'node:path';

// Delete content of a folder recursively except the `.gitignore` files
const deleteContentFolderRecursiveSync = (pathFolder: string) => {
	if (fs.existsSync(pathFolder)) {
		for (const file of fs.readdirSync(pathFolder)) {
			if (file === '.gitignore') {
				continue;
			}

			const currentPath = path.join(pathFolder, file);
			if (fs.lstatSync(currentPath).isDirectory()) {
				deleteContentFolderRecursiveSync(currentPath);
				fs.rmdirSync(currentPath);
			} else {
				fs.unlinkSync(currentPath);
			}
		}
	}
};

export {deleteContentFolderRecursiveSync};
