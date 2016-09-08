'use strict';

import fs       from 'fs';
import path     from 'path';
import inquirer from 'inquirer';
import chalk    from 'chalk';

import CLI    from './lib/cli';
import Server from './lib/server';
import List   from './lib/list';
import Tax    from './lib/tax';

import {Transactions} from './lib/Data';

global.port = 1234;

global.paths = {
  CSV_PATH: path.resolve(__dirname, './place-csvs-here'),
  CLIENT_PATH: './client/public'
};

global.currency = '£';

const cli = new CLI();
const flags = cli.flags;

// I want to rewrite this or move it somewhere or just generally make it
// far more streamlined!
const actions = {
  main: (answers) => {
    switch (answers.action) {
      case 'server':
        return new Server({port: global.port});
      case 'view_all':
        return new List();
      case 'view_incoming':
        return new List({filter: 'incoming'});
      case 'view_outgoing':
        return new List({filter: 'outgoing'});
      case 'do_taxes':
        inquirer.prompt([{
          type: 'list',
          name: 'taxYear',
          message: 'Which tax year?',
          choices: [
            {value: '2013/2014', name: '2013/2014'},
            {value: '2014/2015', name: '2014/2015'},
            {value: '2015/2016', name: '2015/2016'},
            {value: '2016/2017', name: '2016/2017'}
          ]
        }]).then((answers) => {
          return new Tax({taxYear: answers.taxYear});
        });
        break;
      case 'rebuild_cache':
        return Transactions.setCache()
          .then(() => console.log('The cache was rebuilt.'))
          .catch(() => console.error(chalk.red('Could not save the cache. Is couchbase running?')));
      default:
        console.warn(`Did not understand the action ${answers.action}`);
        break;
    }
  }
};

if (cli.flags && flags.action) {
  actions.main({action: flags.action});
}
else {
  cli.prompt().then(actions.main);
}
