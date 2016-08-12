'use strict';

import _        from 'lodash';
import table    from 'text-table';
import inquirer from 'inquirer';
import moment   from 'moment';
import chalk    from 'chalk';

import {Transactions} from './Data';

module.exports = class List {

  constructor (opts) {
    opts = opts || {};
    opts.filter = opts.filter || null;
    Transactions.getCache().then((data) => {
      if (opts.filter === 'incoming') {
        data = _.filter(data, (val) => Number(val.Value) > 0);
      }
      if (opts.filter === 'outgoing') {
        data = _.filter(data, (val) => Number(val.Value) < 0);
      }
      this.data = data;
      this.sort().display().prompt();
    });
    return this;
  }

  sort (type, desc) {
    type = type || 'date';
    this.data = _.sortBy(this.data, (x) => {
      if (type === 'date') {
        return moment(x['Date'], 'DD/MM/YYYY').unix();
      }
      if (type === 'value') {
        return x.Value;
      }
    });
    if (desc) this.data = this.data.reverse();
    return this;
  }

  display () {
    var output = _.map(this.data, (val) => [val.Value, val.Date, val.Description]);
    console.log(table(output));
    return this;
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
        {value: 'exit', name: 'Exit'},
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
            {value: 'exit', name: 'Exit'},
          ]
        }]).then((answers) => {
          if (answers.reorder === 'date_asc') {
            this.sort('date', false).display();
          }
          if (answers.reorder === 'date_desc') {
            this.sort('date', true).display();
          }
          if (answers.reorder === 'value_asc') {
            this.sort('value', false).display();
          }
          if (answers.reorder === 'value_desc') {
            this.sort('value', true).display();
          }
          this.prompt();
        });
      }
      if (answers.action === 'filter') {
        console.log('This does nothing!');
        this.display();
      }
      if (answers.action === 'back') {
        console.log('This does nothing!');
        this.display();
      }
      if (answers.action === 'exit') {
        process.exit(0);
      }
    });
    return this;
  }

}
