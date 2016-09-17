'use strict';

import _        from 'lodash';
import table    from 'text-table';
import inquirer from 'inquirer';
import moment   from 'moment';
import chalk    from 'chalk';

import Base from './base';

import {Transactions} from './Data';

export default class List {

  constructor (opts = {filter: null}) {
    Transactions.getTransactions()
    .then((data) => Transactions.filter(data, opts))
    .then((data) => this.sort(data, 'date', false))
    .then((data) => List.displayTable(data))
    .then((data) => this.prompt(data));
    return this;
  }

  sort (data = [], type = 'date', desc = false) {
    let sortedData = _.sortBy(data, (row) => {
      if (type === 'date') return moment(row.Date, Base.dateFormat).unix();
      if (type === 'value') return row.Value;
      return row.Value;
    });
    if (desc) sortedData = sortedData.reverse();
    return sortedData;
  }

  static displayTable (data = []) {
    if (!data.length) {
      return data;
    }
    const output = _.map(data, (row) => (
      [
        chalk.cyan(Base.formatCurrency(row.Value, false)),
        chalk.dim(row.Type || '???'),
        chalk.yellow(row.Date),
        row.Description
      ]
    ));
    console.log(table(output, {
      align: ['r']
    }));
    return data;
  }

  prompt () {
    inquirer.prompt([{
      type: 'list',
      name: 'action',
      message: 'What would you like to do now?',
      choices: [
        {value: 'reorder', name: 'Reorder list'},
        {value: 'filter', name: 'Filter list'},
        {value: 'back', name: 'Go back'},
        {value: 'exit', name: 'Exit'}
      ]
    }]).then((answers) => {
      if (answers.action === 'reorder') {
        inquirer.prompt([{
          type: 'list',
          name: 'reorder',
          message: 'How would you like to reorder the list?',
          choices: [
            {value: 'date_asc', name: `Date ${chalk.bold('asc')}`},
            {value: 'date_desc', name: `Date ${chalk.bold('desc')}`},
            {value: 'value_asc', name: `Value ${chalk.bold('asc')}`},
            {value: 'value_desc', name: `Value ${chalk.bold('desc')}`},
            {value: 'back', name: 'Go back'},
            {value: 'exit', name: 'Exit'}
          ]
        }]).then((answers) => {
          if (answers.reorder === 'date_asc') {
            this.sort('date', false).displayTable();
          }
          if (answers.reorder === 'date_desc') {
            this.sort('date', true).displayTable();
          }
          if (answers.reorder === 'value_asc') {
            this.sort('value', false).displayTable();
          }
          if (answers.reorder === 'value_desc') {
            this.sort('value', true).displayTable();
          }
          this.prompt();
        });
      }
      if (answers.action === 'filter') {
        console.log('This does nothing!');
        this.displayTable();
      }
      if (answers.action === 'back') {
        console.log('This does nothing!');
        this.displayTable();
      }
      if (answers.action === 'exit') {
        process.exit(0);
      }
    });
    return this;
  }
}
