const test = require('ava');
const mockfs = require('mock-fs');
const amunet = require('..');

test.beforeEach.cb(t => {
	mockfs({
		'/some/test/directory': {
			'some-file.txt': mockfs.file({
				content: 'file content here',
				mode: 0
			}),
			'write-sync-separate.md': mockfs.file({
				content: '\n[a]: # (1)\n\n[b]: # (2)\n\n[c]: # (3)\n\n# Doc\n\nHello world'
			}),
			'write-async-separate.md': mockfs.file({
				content: '\n[a]: # (1)\n\n[b]: # (2)\n\n[c]: # (3)\n\n# Doc\n\nHello world'
			})
		}
	});
	t.end();
});

test.afterEach.cb(t => {
	mockfs.restore();
	t.end();
});

test('Read async file when permission denied', async t => {
	const error = await t.throwsAsync(amunet.read('/some/test/directory/some-file.txt'));
	t.is(error.code, 'EACCES');
});

test('Read sync file when permission denied', t => {
	const error = t.throws(() => {
		amunet.readSync('/some/test/directory/some-file.txt');
	}, Error);
	t.is(error.code, 'EACCES');
});

test('Write async file when permission denied', async t => {
	const error = await t.throwsAsync(amunet.write('/some/test/directory/some-file.txt'));
	t.is(error.code, 'EACCES');
});

test('Write sync file when permission denied', t => {
	const error = t.throws(() => {
		amunet.writeSync('/some/test/directory/some-file.txt');
	}, Error);
	t.is(error.code, 'EACCES');
});
