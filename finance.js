"use strict";

import fs       from 'fs';
import path     from 'path';
import glob     from 'glob';
import inquirer from 'inquirer';
import emoji    from 'node-emoji';

import CLI    from './lib/cli';
import Server from './lib/server';
import List   from './lib/list';

const port = 1234;

global.paths = {
  CSV_PATH:    './place-csvs-here',
  CLIENT_PATH: './client2/public',
}

const cli = new CLI();

if (cli.flags.useOld) {
  global.paths.CLIENT_PATH = './client/public';
}

// I want to rewrite this or move it somewhere or just generally make it
// far more streamlined!
const actions = {
  main: (answers) => {
    if (answers.action === 'server') {
      return new Server({port: port});
    }
    if (answers.action === 'view_all') {
      return new List();
    }
    if (answers.action === 'view_incoming') {
      return new List({filter: 'incoming'});
    }
    if (answers.action === 'view_outgoing') {
      return new List({filter: 'outgoing'});
    }
  },
  setup: (answers) => {
    if (answers.action === 'setup') {
      console.log('Yeah, sorry.');
    }
    if (answers.action === 'exit') {
      process.exit(0);
    }
  }
}

// Same with this, pretty ugly at the moment.
glob(`${GLOBAL.paths.CSV_PATH}/*.csv`, (err, files) => {

  if (err || !files.length) {
    console.warn('You have not got any CSVs to parse through!');
    inquirer.prompt([{
      type: 'list',
      name: 'action',
      message: 'Please choose an action:',
      choices: [
        {value: 'setup', name: 'Setup your files with our handy wizard (doesn\'t work)'},
        {value: 'exit', name: 'Exit'},
      ]
    }]).then(actions.setup);
  }
  else {
    if (cli.flags && cli.flags.action) {
      return actions.main({action: cli.flags.action});
    }
    inquirer.prompt([{
      type: 'list',
      name: 'action',
      message: 'Please choose an action:',
      choices: [
        {value: 'server', name: `Start up a server on port ${port}`},
        {value: 'view_all', name: 'View all transactions'},
        {value: 'view_incoming', name: `View INCOMING transactions ${emoji.get('sunglasses')}`},
        {value: 'view_outgoing', name: `View OUTGOING transactions ${emoji.get('cold_sweat')}`}
      ]
    }]).then(actions.main);
  }
});
