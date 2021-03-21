#!/usr/bin/env node

// Inspired by:
// <https://github.com/saojs/sao/issues/50>
// <https://github.com/nuxt-community/create-nuxt-app/blob/master/packages/create-nuxt-app/package.json>

const path = require('path');
const cac = require('cac');
const sao = require('sao');
const update = require('update-notifier');

const pkg = require('./package');

const cli = cac();

cli
  .command('<name>', 'Generate a new project')
  .action((name) => {
    const folderName = name;
    const outDir = path.resolve(folderName);
    console.log(`> Generating project in ${outDir}`);

    const generator = path.dirname(require.resolve('./package'));

    sao({ generator, outDir })
      .run()
      .catch((error_) => {
        console.trace(error_);
        process.exit(1);
      });
  })
  .example('lad my-new-project');

cli.version(pkg.version);
cli.help();
cli.parse();

update({ pkg }).notify();
