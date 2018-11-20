'use strict';

import _ from 'lodash';
import table from 'text-table';
import moment from 'moment';
import chalk from 'chalk';
import fs from 'fs';
import path from 'path';

import Base from './base';
import { Transactions } from './Data';
import List from './list';

let exclusions = {};

try {
  exclusions = require('../.taxexclusions.json');
}
catch (e) {
  // ...
}

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

export default class Tax {
  constructor (opts = {}) {
    this.opts = opts;
    this.taxYear = taxYears[this.opts.taxYear];
    Transactions.getTransactions().then((data) => {
      return this.filter(data);
    }).then((data) => {
      this.data = data;
      this.display();
    });

    Transactions.getTransactions().then((data) => {
      return this.filterExpenses(data);
    }).then((data) => {
      List.displayTable(data);
    });
  }
  filterExpenses (data) {
    const opts = {};
    opts.filter = 'outgoing';
    const expenses = ['DIGITALOCEAN', 'RACKSPACE', 'GITHUB', 'PAYMO'];
    opts.inclusions = expenses;
    opts.startDate = this.taxYear.filters.startDate;
    opts.endDate = this.taxYear.filters.endDate;
    return Transactions.filter(data, opts);
  }
  filter (data) {
    if (this.taxYear === undefined) {
      throw new Error('Tax year is undefined!');
    }
    this.opts.filter = 'incoming';
    this.opts.exclusions = this.taxYear.filters.exclusions;
    this.opts.startDate = this.taxYear.filters.startDate;
    this.opts.endDate = this.taxYear.filters.endDate;
    return Transactions.filter(data, this.opts);
  }
  displayTable () {
    if (!this.data.length) {
      return this;
    }
    List.displayTable(this.data);
    return this;
  }
  displayTotal () {
    let passedTaxFreeAllowance = null;
    const totalIncome = _.reduce(this.data, (sum, val) => {
      const newSum = parseFloat(val.Value) + sum;
      if (newSum > this.taxYear.taxFreeAllowance && !passedTaxFreeAllowance) {
        passedTaxFreeAllowance = val;
      }
      return newSum;
    }, 0);
    console.log(`\nTotal income pre-tax: ${chalk.cyan(Base.formatCurrency(totalIncome))}`);
    if (totalIncome < this.taxYear.taxFreeAllowance) {
      console.log(chalk.magenta('\nYou don\'t have have to pay any tax because you\'re too poor! Bonzer!'));
    }
    else {
      const taxableWage = totalIncome - this.taxYear.taxFreeAllowance;
      console.log(`Taxable wage: ${chalk.cyan(Base.formatCurrency(taxableWage))}`);
      console.log(`Tax to pay: ${chalk.cyan(Base.formatCurrency(taxableWage * 0.2))}`);
      if (passedTaxFreeAllowance) {
        console.log(`You passed your tax-free allowance on ${chalk.cyan(passedTaxFreeAllowance.Date)}`);
      }
    }
    if (moment(this.taxYear.filters.endDate, Base.dateFormat).isAfter(moment())) {
      console.log(chalk.magenta('\nPlease be aware that this tax year is not over. Pro-rata guesswork is not the best idea.'));
      let latestDateMoment = moment(_.last(this.data).Date, Base.dateFormat);
      let latestDateMethod = 'latest transaction';
      if (moment().isAfter(latestDateMoment)) {
        latestDateMoment = moment();
        latestDateMethod = 'current date';
      }
      const proRataDays = latestDateMoment.diff(moment(this.taxYear.filters.startDate, Base.dateFormat), 'days');
      const proRataIncome = totalIncome / proRataDays * 365;
      const proRataTaxableWage = proRataIncome - this.taxYear.taxFreeAllowance;
      console.log(`Pro-rata days: ${chalk.cyan(proRataDays)} based on ${latestDateMethod}`);
      console.log(`Total pro-rata income pre-tax: ${chalk.cyan(Base.formatCurrency(proRataIncome))}`);
      console.log(`Pro-rata taxable wage: ${chalk.cyan(Base.formatCurrency(proRataTaxableWage))}`);
      console.log(`Pro-rata tax to pay: ${chalk.cyan(Base.formatCurrency(proRataTaxableWage * 0.2))}`);
    }
    return this;
  }
  display () {
    console.log(`\nResults for tax year ${this.opts.taxYear}:\n`);
    this.displayTable().displayTotal();
    console.log();
    return this;
  }
}
