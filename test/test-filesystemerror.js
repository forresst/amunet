const test = require('ava');
const mockfs = require('mock-fs');
const amunet = require('..');

test.beforeEach.cb(t => {
	mockfs({
		'/test/directory': {
			'file-denied.txt': mockfs.file({
				content: 'file content here',
				mode: 0
			})
		},
		'/test/directory-denied': mockfs.directory({
			mode: 0,
			items: {
				'file-in-denied-directory': 'file content here'
			}
		})
	});
	t.end();
});

test.afterEach.cb(t => {
	mockfs.restore();
	t.end();
});

test('Read async file when permission denied', async t => {
	const error = await t.throwsAsync(amunet.read('/test/directory/file-denied.txt'));
	t.is(error.code, 'EACCES');
});

test('Read sync file when permission denied', t => {
	const error = t.throws(() => {
		amunet.readSync('/test/directory/file-denied.txt');
	}, {
		instanceOf: Error
	});
	t.is(error.code, 'EACCES');
});

test('Write async file when permission denied', async t => {
	const error = await t.throwsAsync(amunet.write('/test/directory/file-denied.txt'));
	t.is(error.code, 'EACCES');
});

test('Write sync file when permission denied', t => {
	const error = t.throws(() => {
		amunet.writeSync('/test/directory/file-denied.txt');
	}, {
		instanceOf: Error
	});
	t.is(error.code, 'EACCES');
});

test('Read async file in directory permission denied', async t => {
	const error = await t.throwsAsync(amunet.read('/test/directory-denied/file-in-denied-directory.txt'));
	t.is(error.code, 'EACCES');
});

test('Read sync file in directory permission denied', t => {
	const error = t.throws(() => {
		amunet.readSync('/test/directory-denied/file-in-denied-directory.txt');
	}, {
		instanceOf: Error
	});
	t.is(error.code, 'EACCES');
});

test('Write async file in directory permission denied', async t => {
	const error = await t.throwsAsync(amunet.write('/test/directory-denied/file-in-denied-directory.txt'));
	t.is(error.code, 'EACCES');
});

test('Write sync file in directory permission denied', t => {
	const error = t.throws(() => {
		amunet.writeSync('/test/directory-denied/file-in-denied-directory.txt');
	}, {
		instanceOf: Error
	});
	t.is(error.code, 'EACCES');
});

test('Write async file in sub-directory of directory permission denied', async t => {
	const error = await t.throwsAsync(amunet.write('/test/directory-denied/sub-dir/file.txt'));
	t.is(error.code, 'EACCES');
});

test('Write sync file in sub-directory of directory permission denied', t => {
	const error = t.throws(() => {
		amunet.writeSync('/test/directory-denied/sub-dir/file.txt');
	}, {
		instanceOf: Error
	});
	t.is(error.code, 'EACCES');
});
