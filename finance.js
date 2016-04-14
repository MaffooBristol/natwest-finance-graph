#!/usr/bin/env node
'use strict';

// Rows are: Date, Type, Description, Value, Balance, Account Name, Account Number

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const inquirer = require('inquirer');
const emoji = require('node-emoji');

const Server = require('./lib/server.js');
const List = require('./lib/list.js');

const port = 1234;

GLOBAL.paths = {
  CSV_PATH: './place-csvs-here',
  CLIENT_PATH: './frontend/public',
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
    }]).then((answers) => {
      if (answers.action === 'setup') {
        console.log('Yeah, sorry.');
      }
      if (answers.action === 'exit') {
        process.exit(0);
      }
    });
  }
  else {
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
    }]).then((answers) => {
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
    });
  }


});
