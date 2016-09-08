'use strict';

import _      from 'lodash';
import table  from 'text-table';
import moment from 'moment';
import chalk  from 'chalk';

import Base from './base';
import {Transactions} from './Data';

export default class Appraisal {
  constructor () {
    Transactions.getTransactions()
    .then((data) => this.thisMonth(data))
    .then((data) => this.thisYear(data));
  }
  totalIncome (data) {
    let _data = Transactions.filter(data, {filter: 'incoming'});
    console.log(_data);
    return _.reduce(_data, (sum, val) => {
      return parseFloat(val.Value) + sum;
    }, 0);
  }
  thisMonth (data) {
    console.log('This month:');
    let monthData = Transactions.filter(data, {groupBy: 'month'});
    let totalIncome = this.totalIncome(monthData);
    console.log(Base.formatCurrency(totalIncome));
    return data;
  }
  thisYear (data) {
    console.log('This year');
    return data;
  }
}
