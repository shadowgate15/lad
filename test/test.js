const path = require('path');
const test = require('ava');
const sao = require('sao');

const generator = path.join(__dirname, '..');

const defaults = {
  name: 'lad',
  description: 'my project description',
  author: 'Nick Baugh',
  email: 'niftylettuce@gmail.com',
  website: 'http://niftylettuce.com',
  username: 'niftylettuce'
};

test('defaults', async (t) => {
  const stream = await sao.mock(
    { generator },
    {
      ...defaults,
      name: 'my-package-name'
    }
  );
  t.snapshot(
    stream.fileList
      .sort()
      .filter(
        (name) =>
          !name.includes('/snapshots') &&
          !name.startsWith('.base64-cache/') &&
          !name.startsWith('locales/')
      ),
    'generated files'
  );
  const content = await stream.readFile('README.md');
  t.snapshot(content, 'content of README.md');
});

test('invalid name', async (t) => {
  await t.throwsAsync(
    sao.mock({ generator }, { ...defaults, name: 'Foo Bar Baz Beep' }),
    { message: /package name cannot have uppercase letters/ }
  );
});

test('invalid email', async (t) => {
  const error = await t.throwsAsync(
    await sao.mock({ generator }, { ...defaults, email: 'niftylettuce' })
  );
  t.regex(error.message, /Invalid email/);
});

test('invalid website', async (t) => {
  const error = await t.throwsAsync(
    await sao.mock({ generator }, { ...defaults, website: 'niftylettuce' })
  );
  t.regex(error.message, /Invalid URL/);
});

test('invalid username', async (t) => {
  const error = await t.throwsAsync(
    await sao.mock({ generator }, { ...defaults, username: '$$$' })
  );
  t.regex(error.message, /Invalid GitHub username/);
});

test('invalid repo', async (t) => {
  const error = await t.throwsAsync(
    await sao.mock(
      { generator },
      {
        ...defaults,
        username: 'lassjs',
        repo: 'https://bitbucket.org/foo/bar'
      }
    )
  );
  t.regex(
    error.message,
    /Please include a valid GitHub.com URL without a trailing slash/
  );
});

test('no bree', async (t) => {
  const stream = await sao.mock(
    { generator },
    {
      ...defaults,
      bree: 'no'
    }
  );

  // Bree.js is removed
  t.false(stream.fileList.includes('bree.js'));

  // Bree is removed from package.json
  const pkg = await stream.readFile('package.json');
  t.false(pkg.includes('bree'));
});
