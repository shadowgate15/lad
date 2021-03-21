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
  templateData: {
    camelcase,
    uppercamelcase,
    slug
  },
  prompts: [
    {
      name: 'name',
      message: 'What is the name of the new project',
      default: '{outFolder}',
      validate: (value) => {
        if (process.env.NODE_ENV === 'test' && value === 'lad') {
          return true;
        }

        return isValidNpmName(value);
      }
    },
    {
      name: 'description',
      message: 'How would you describe the new project',
      default: `my ${superb.random()} project`
    },
    {
      name: 'pm',
      message: 'Choose a package manager',
      choices: ['npm', 'yarn'],
      type: 'list',
      default: 'npm',
      store: true
    },
    {
      name: 'author',
      message: 'What is your name (the author’s)',
      default: conf.get('init-author-name') || '{gitUser.name}',
      store: true
    },
    {
      name: 'email',
      message: 'What is your email (the author’s)',
      default: conf.get('init-author-email') || '{gitUser.email}',
      store: true,
      validate: (value) => (isEmail(value) ? true : 'Invalid email')
    },
    {
      name: 'website',
      message: 'What is your personal website (the author’s)',
      default: conf.get('init-author-url') || '',
      store: true,
      validate: (value) => (value === '' || isURL(value) ? true : 'Invalid URL')
    },
    {
      name: 'username',
      message: 'What is your GitHub username or organization',
      default: '{gitUser.username}',
      store: true,
      validate: (value) =>
        githubUsernameRegex.test(value) ? true : 'Invalid GitHub username'
    },
    {
      name: 'repo',
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
    {
      name: 'web',
      message: 'Do you need a web server (@ladjs/web)',
      type: 'confirm',
      default: true
    },
    {
      name: 'api',
      message: 'Do you need an API server (@ladjs/api)',
      type: 'confirm',
      default: true
    },
    {
      name: 'bree',
      message: 'Do you need a job scheduler (bree)',
      type: 'confirm',
      default: true
    },
    {
      name: 'proxy',
      message: 'Do you need a proxy (http => https redirect)',
      type: 'confirm',
      default: true
    },
    {
      name: 'i18n',
      message: 'Do you need automatic multi-lingual support',
      type: 'confirm',
      default: true,
      when: (answers) => answers.web || answers.api
    }
  ],
  actions() {
    const actions = [
      {
        type: 'add',
        files: '**',
        filters: {
          // Keeping this here as a safety guard per this gh issue
          // <https://github.com/saojs/sao/issues/59>
          'node_modules/**': false,

          // Never copy env file
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
        }
      },
      {
        type: 'move',
        patterns: {
          // We keep `.gitignore` as `gitignore` in the project
          // Because when it's published to npm
          // `.gitignore` file will be ignored!
          gitignore: '.gitignore',
          README: 'README.md',
          env: '.env'
        }
      }
    ];

    // TODO: this.answers.bree
    if (this.answers.bree) {
      // - remove from pkg
      actions.push({
        type: 'modify',
        files: 'package.json',
        handler(data, _) {
          delete data.dependencies.bree;

          return data;
        }
      });

      // - remove config
      // - remove tests
    }

    // TODO: this.answers.web
    // - remove from pkg
    // - remove config
    // - remove tests

    // TODO: this.answers.i18n
    // - remove from pkg
    // - remove config
    // - remove tests

    // TODO: this.answers.api
    // - remove from pkg
    // - remove config
    // - remove tests

    return actions;
  },
  async completed() {
    this.gitInit();

    await this.npmInstall({ npmClient: this.answers.pm });

    this.showProjectTips();
  }
};
