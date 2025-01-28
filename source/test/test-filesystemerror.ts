import test from 'ava';
import mockfs from 'mock-fs';
import {
	read,
	readSync,
	write,
	writeSync,
} from '../index.js';

test.beforeEach(() => {
	// Create a mock file system with :
	// - `/directory` with read permission allowed
	//     - `/directory/file-denied.txt` with read permission denied
	// - `/directory-denied` with read permission denied
	//     - `/directory-denied/file-in-denied-directory.txt` with read permission allowed but in a directory with read permission denied
	mockfs({
		// eslint-disable-next-line @typescript-eslint/naming-convention
		'/directory': {
			'file-denied.txt': mockfs.file({
				content: 'file content here',
				mode: 0,
			}),
		},
		'/directory-denied': mockfs.directory({
			mode: 0,
			items: {
				'file-in-denied-directory': 'file content here',
			},
		}),
	});
});

test.afterEach(() => {
	// Restore the file system
	mockfs.restore();
});

const pathFileDenied = '/directory/file-denied.txt';
const pathFileInDirectoryDenied = '/directory-denied/file-in-denied-directory.txt';
const pathFileInSubDirectoryDenied = '/directory-denied/sub-dir/file.txt';

test('Read async file when permission denied', async t => {
	await t.throwsAsync(read(pathFileDenied), {any: true, message: /EACCES/});
});

test('Read sync file when permission denied', t => {
	t.throws(() => readSync(pathFileDenied), {any: true, message: /EACCES/});
});

test('Write async file when permission denied', async t => {
	await t.throwsAsync(write(pathFileDenied, {}), {any: true, message: /EACCES/});
});

test('Write sync file when permission denied', t => {
	t.throws(() => {
		writeSync(pathFileDenied, {});
	}, {any: true, message: /EACCES/});
});

test('Read async file in directory permission denied', async t => {
	await t.throwsAsync(read(pathFileInDirectoryDenied), {any: true, message: /EACCES/});
});

test('Read sync file in directory permission denied', t => {
	t.throws(() => readSync(pathFileInDirectoryDenied), {any: true, message: /EACCES/});
});

test('Write async file in directory permission denied', async t => {
	await t.throwsAsync(write(pathFileInDirectoryDenied, {}), {any: true, message: /EACCES/});
});

test('Write sync file in directory permission denied', t => {
	t.throws(() => {
		writeSync(pathFileInDirectoryDenied, {});
	}, {any: true, message: /EACCES/});
});

test('Write async file in sub-directory of directory permission denied', async t => {
	await t.throwsAsync(write(pathFileInSubDirectoryDenied, {}), {any: true, message: /EACCES/});
});

test('Write sync file in sub-directory of directory permission denied', t => {
	t.throws(() => {
		writeSync(pathFileInSubDirectoryDenied, {});
	}, {any: true, message: /EACCES/});
});
