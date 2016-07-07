#!/usr/bin/env node
'use strict';

// Rows are: Date, Type, Description, Value, Balance, Account Name, Account Number

const fs       = require('fs');
const path     = require('path');
const glob     = require('glob');
const inquirer = require('inquirer');
const meow     = require('meow');
const emoji    = require('node-emoji');

const Server = require('./lib/server.js');
const List   = require('./lib/list.js');

const port = 1234;

GLOBAL.paths = {
  CSV_PATH:    './place-csvs-here',
  CLIENT_PATH: './client2/public',
}

const cli = meow(`
    Usage
      $ ./finance.js

    Options
      -s, --action server         Start the client server
      -a, --action view-all       View a list of all transactions
      -i, --action view-incoming  View a list of incoming transactions
      -o, --action view-outgoing  View a list of outgoing transactions
      -O, --use-old               Use the old version of the app (Backbone)

    Examples
      $ ./finance.js -s
      $ ./finance.js --view-outgoing

`, {
  alias: {
    s: 'server',
    a: 'view_all',
    i: 'view_incoming',
    o: 'view_outgoing',
    O: 'use_old'
  }
});

if (cli.flags.useOld) {
  GLOBAL.paths.CLIENT_PATH = './client/public';
}

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
