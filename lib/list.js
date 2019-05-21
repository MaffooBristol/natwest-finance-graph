'use strict';

import _ from 'lodash';
import table from 'text-table';
import inquirer from 'inquirer';
import moment from 'moment';
import chalk from 'chalk';

import Base from './base';

import { Transactions } from './Data';

// @todo move this
let exclusions = {};
try {
  exclusions = require('../.taxexclusions.json');
}
catch (e) {
  // ...
}
// @todo move this
const taxYears = _.mapValues({
  '2013/2014': {
    filters: {
      startDate: '06/04/2013',
      endDate: '05/04/2014'
    },
    taxFreeAllowance: 9000
  },
  '2014/2015': {
    filters: {
      startDate: '06/04/2014',
      endDate: '05/04/2015'
    },
    taxFreeAllowance: 10000
  },
  '2015/2016': {
    filters: {
      startDate: '06/04/2015',
      endDate: '05/04/2016'
    },
    taxFreeAllowance: 10600
  },
  '2016/2017': {
    filters: {
      startDate: '06/04/2016',
      endDate: '05/04/2017'
    },
    taxFreeAllowance: 11000
  },
  '2017/2018': {
    filters: {
      startDate: '06/04/2017',
      endDate: '05/04/2018'
    },
    taxFreeAllowance: 11500
  }
}, (taxYear, key) => {
  if (exclusions !== undefined && exclusions[key]) {
    taxYear.filters.exclusions = exclusions[key];
  }
  return taxYear;
});

export default class List {
  constructor (opts = { filter: null }) {
    this.opts = opts;
    return this;
  }

  display () {
    Transactions.getTransactions()
      .then((data) => Transactions.filter(data, this.opts))
			//.then((data) => data.filter((row) => row.Type === 'POS' || row.Type === 'D/D'))
      .then((data) => this.sort(data, 'date', false))
      .then((data) => List.displayTable(data))
      .then((data) => this.prompt(data));
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
        chalk.cyan(Base.formatCurrency(row.Balance, false)),
        chalk.dim(row.Type || '???'),
        chalk.yellow(row.Date),
        row.Description
      ]
    ));
    console.log(table(output, {
      align: ['r']
    }));
    const totalValue = Base.formatCurrency(_.reduce(_.map(data, 'Value'), (row1, row2) => {
      return parseFloat(row1) + parseFloat(row2);
    }, 0));
    console.log(chalk.dim('Total value of displayed rows: ') + chalk.magenta(totalValue));
    return data;
  }

  prompt () {
    inquirer.prompt([{
      type: 'list',
      name: 'action',
      message: 'What would you like to do now?',
      choices: [
        { value: 'reorder', name: 'Reorder list' },
        { value: 'filter', name: 'Filter list' },
        { value: 'back', name: 'Go back' },
        { value: 'exit', name: 'Exit' }
      ]
    }]).then((answers) => {
      if (answers.action === 'reorder') {
        inquirer.prompt([{
          type: 'list',
          name: 'reorder',
          message: 'How would you like to reorder the list?',
          choices: [
            { value: 'date_asc', name: `Date ${chalk.bold('asc')}` },
            { value: 'date_desc', name: `Date ${chalk.bold('desc')}` },
            { value: 'value_asc', name: `Value ${chalk.bold('asc')}` },
            { value: 'value_desc', name: `Value ${chalk.bold('desc')}` },
            { value: 'back', name: 'Go back' },
            { value: 'exit', name: 'Exit' }
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
        inquirer.prompt([{
          type: 'list',
          name: 'filter_type',
          message: 'How would you like to filter?',
          choices: [
            { value: 'by_date', name: 'By date range' },
            { value: 'by_keyword', name: 'By keyword' }
          ]
        }]).then((answers) => {
          if (answers.filter_type === 'by_keyword') {
            inquirer.prompt([{
              type: 'input',
              name: 'inclusions',
              message: 'Please enter any search terms, separated by commas'
            }]).then((answers) => {
              // this.opts.inclusions = ['CLOUD9', 'DIGITALOCEAN', 'RACKSPACE', 'GITHUB', 'PAYMO', 'O2', 'GIFFGAFF'];
              this.opts.inclusions = answers.inclusions.split(',').map((term) => term.trim());
              this.opts.exclusions = false;
              this.display();
            });
          }
          else if (answers.filter_type === 'by_date') {
            inquirer.prompt([{
              type: 'list',
              name: 'tax_year',
              message: 'Please choose the tax year',
              choices: _.map(taxYears, (taxYear, value) => ({ value, name: value }))
            }]).then((answers) => {
              if (answers.tax_year === 'clear') {
                this.opts.startDate = null;
                this.opts.endDate = null;
              }
              const taxYear = taxYears[answers.tax_year];
              this.opts.startDate = taxYear.filters.startDate;
              this.opts.endDate = taxYear.filters.endDate;
              this.display();
            });
          }
        });
      }
      if (answers.action === 'back') {
        console.log('This does nothing!');
        List.displayTable();
      }
      if (answers.action === 'exit') {
        process.exit(0);
      }
    });
    return this;
  }
}
