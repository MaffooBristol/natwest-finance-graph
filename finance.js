'use strict';

import fs       from 'fs';
import path     from 'path';
import glob     from 'glob';

import CLI    from './lib/cli';
import Server from './lib/server';
import List   from './lib/list';

import {Transactions} from './lib/Data';

global.port = 1234;

global.paths = {
  CSV_PATH: './place-csvs-here',
  CLIENT_PATH: './client/public'
};

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
      case 'rebuild_cache':
        return Transactions.setCache().then(() => {
          console.log('The cache was rebuilt.');
        }).catch((err) => {
          console.error(`Caught an error: ${err.message}`);
        }).error((err) => {
          console.error(`Uncaught error: ${err.message}`);
        });
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
