'use strict';

import fs from 'fs';
import path from 'path';
import inquirer from 'inquirer';
import chalk from 'chalk';

import CLI from './cli';
import Server from './server';
import List from './list';
import Tax from './tax';
import BigBoys from './bigboys';

import {Transactions} from './Data';

global.port = 1234;

global.paths = {
  CSV_PATH: path.resolve(__dirname, '../place-csvs-here'),
  CLIENT_PATH: path.resolve(__dirname, '../client/public')
};

global.currency = '£';

const cli = new CLI();

// I want to rewrite this or move it somewhere or just generally make it
// far more streamlined!
const actions = {
  main: (answers) => {
    switch (answers.action) {
      case 'server':
      case 'serve':
        return new Server({port: global.port});
      case 'view_all':
      case 'view':
      case 'list_all':
      case 'list':
        return (new List()).display();
      case 'view_incoming':
      case 'list_incoming':
      case 'incoming':
        return (new List({filter: 'incoming'})).display();
      case 'view_outgoing':
      case 'list_outgoing':
      case 'outgoing':
        return (new List({filter: 'outgoing'})).display();
      case 'taxes':
      case 'tax':
        inquirer.prompt([{
          type: 'list',
          name: 'taxYear',
          message: 'Which tax year?',
          choices: [
            {value: '2013/2014', name: '2013/2014'},
            {value: '2014/2015', name: '2014/2015'},
            {value: '2015/2016', name: '2015/2016'},
            {value: '2016/2017', name: '2016/2017'},
            {value: '2017/2018', name: '2017/2018'},
          ]
        }]).then((answers) => {
          return new Tax({taxYear: answers.taxYear});
        });
        break;
      case 'rebuild_cache':
      case 'cc':
        return Transactions.setCache()
          .then(() => console.log('The cache was rebuilt.'))
          .catch(() => console.error(chalk.red('Could not save the cache. Is couchbase running?')));
			case 'big_boys':
				return (new BigBoys()).display();
      case 'help':
        console.log('Did you mean badger --help?');
        break;
      default:
        console.warn(`Did not understand the action ${answers.action}`);
        break;
    }
  }
};

if (cli.selection) {
  actions.main({action: cli.selection});
}
else {
  cli.prompt().then(actions.main);
}
