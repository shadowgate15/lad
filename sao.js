const githubUsernameRegex = require('github-username-regex');
const isURL = require('is-url');
const isEmail = require('is-email');
const superb = require('superb');
const camelcase = require('camelcase');
const uppercamelcase = require('uppercamelcase');
const slug = require('speakingurl');
const npmConf = require('npm-conf');
const isValidNpmName = require('is-valid-npm-name');

const conf = npmConf();

module.exports = {
  enforceNewFolder: true,
  templateOptions: {
    context: {
      camelcase,
      uppercamelcase,
      slug
    }
  },
  prompts: {
    name: {
      message: 'What is the name of the new project',
      default: ':folderName:',
      validate: (value) => {
        if (process.env.NODE_ENV === 'test' && value === 'lad') return true;
        return isValidNpmName(value);
      }
    },
    description: {
      message: 'How would you describe the new project',
      default: `my ${superb.random()} project`
    },
    pm: {
      message: 'Choose a package manager',
      choices: ['npm', 'yarn'],
      type: 'list',
      default: 'npm',
      store: true
    },
    author: {
      message: 'What is your name (the author’s)',
      default: conf.get('init-author-name') || ':gitUser:',
      store: true
    },
    email: {
      message: 'What is your email (the author’s)',
      default: conf.get('init-author-email') || ':gitEmail:',
      store: true,
      validate: (value) => (isEmail(value) ? true : 'Invalid email')
    },
    website: {
      message: 'What is your personal website (the author’s)',
      default: conf.get('init-author-url') || '',
      store: true,
      validate: (value) => (value === '' || isURL(value) ? true : 'Invalid URL')
    },
    username: {
      message: 'What is your GitHub username or organization',
      default: ':gitUser:',
      store: true,
      validate: (value) =>
        githubUsernameRegex.test(value) ? true : 'Invalid GitHub username'
    },
    repo: {
      message: 'What is your GitHub repository’s URL',
      default(answers) {
        return `https://github.com/${slug(answers.username)}/${slug(
          slug(answers.name)
        )}`;
      },
      validate: (value) =>
        isURL(value) &&
        value.indexOf('https://github.com/') === 0 &&
        value.lastIndexOf('/') !== value.length - 1
          ? true
          : 'Please include a valid GitHub.com URL without a trailing slash'
    },
    web: {
      message: 'Do you need a web server (@ladjs/web)',
      type: 'confirm',
      default: true
    },
    api: {
      message: 'Do you need an API server (@ladjs/api)',
      type: 'confirm',
      default: true
    },
    bree: {
      message: 'Do you need a job scheduler (bree)',
      type: 'confirm',
      default: true
    },
    proxy: {
      message: 'Do you need a proxy (http => https redirect)',
      type: 'confirm',
      default: true
    },
    i18n: {
      message: 'Do you need automatic multi-lingual support',
      type: 'confirm',
      default: true,
      when: (answers) => answers.web || answers.api
    }
  },
  filters: {
    // keeping this here as a safety guard per this gh issue
    // <https://github.com/saojs/sao/issues/59>
    'node_modules/**': false,

    // never copy env file
    '.env': false,

    // ignore standard dev files
    'coverage/**': false,
    'build/**': false,
    '.nyc_output/**': false,
    '*.log': false,

    'web.js': 'web === true',
    'api.js': 'api === true',
    'bree.js': 'bree === true',
    'proxy.js': 'proxy === true',
    'jobs/**': 'bree === true',

    'test/config/snapshots/': false,
    'test/config/snapshots/**': false,
    'test/web/snapshots/': false,
    'test/web/snapshots/**': false
  },
  move: {
    // We keep `.gitignore` as `gitignore` in the project
    // Because when it's published to npm
    // `.gitignore` file will be ignored!
    gitignore: '.gitignore',
    README: 'README.md',
    env: '.env'
  },
  post: async (ctx) => {
    ctx.gitInit();

    // TODO: ctx.answers.bree
    // - remove from pkg
    // - remove config
    // - remove tests

    // TODO: ctx.answers.web
    // - remove from pkg
    // - remove config
    // - remove tests

    // TODO: ctx.answers.i18n
    // - remove from pkg
    // - remove config
    // - remove tests

    // TODO: ctx.answers.api
    // - remove from pkg
    // - remove config
    // - remove tests

    if (ctx.answers.pm === 'yarn') {
      ctx.yarnInstall();
    } else {
      ctx.npmInstall();
    }

    ctx.showTip();
  }
};
