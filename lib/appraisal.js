'use strict';

import _ from 'lodash';
import table from 'text-table';
import moment from 'moment';
import chalk from 'chalk';

import Base from './base';
import { Transactions } from './Data';

/**
 * In progress...
 */
export default class Appraisal {
  /**
   * In progress...
   */
  constructor () {
    Transactions.getTransactions()
      .then((data) => this.thisMonth(data))
      .then((data) => this.thisYear(data));
  }
  /**
   * In progress...
   *
   * @param {Array} data
   *   The transactions data.
   *
   * @return {Number (float)}
   *   The total income.
   */
  totalIncome (data) {
    const _data = Transactions.filter(data, { filter: 'incoming' });
    return _.reduce(_data, (sum, val) => {
      return parseFloat(val.Value) + sum;
    }, 0);
  }
  /**
   * In progress...
   *
   * @param {Array} data
   *   The transactions data.
   */
  thisMonth (data) {
    console.log('This month:');
    const monthData = Transactions.filter(data, { groupBy: 'month' });
    const totalIncome = this.totalIncome(monthData);
    console.log(Base.formatCurrency(totalIncome));
    return data;
  }
  /**
   * In progress...
   *
   * @param {Array} data
   *   The transactions data.
   */
  thisYear (data) {
    console.log('This year:');
    return data;
  }
}
