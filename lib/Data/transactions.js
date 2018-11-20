'use strict';

import fs from 'fs';
import _ from 'lodash';
import moment from 'moment';
import async from 'async';
import Promise from 'bluebird';

import Base from '../base';
import {Statements, Cache} from './';
import Filter from './Transactions/Filter';

/**
 * Main transactions handler.
 */
export default class Transactions {
  /**
   * Constructor, attaches static filter method onto this inited object.
   */
  constructor () {
    this.filter = Filter.filter;
  }
  /**
   * Get transactions from cache.
   *
   * @return {Array}
   *   An array of transactions.
   */
  getCache () {
    return Cache.getCache('transactions');
  }
  /**
   * Set the transactions to the cache.
   *
   * This passes in the _getTransactionsFromFiles promise, which is handled
   * by the Cache object.
   */
  setCache () {
    return Cache.setCache('transactions', this._getTransactionsFromFiles);
  }
  /**
   * Get the transactions from the statements on the file system.
   *
   * This method also parses, filters, flattens, sorts, etc. the data.
   *
   * @return {Promise}
   *   The promise from getStatementsRows.
   */
  _getTransactionsFromFiles () {
    return Statements.getStatementsRows()
    .then((results) => {
      // Merge all files together.
      return _.flatten(results, true);
    }).then((results) => {
      // Ensure rows are unique.
      return _.uniqBy(results, JSON.stringify);
    }).then((results) => {
      // Ensure we have all the required fields.
      return _.filter(results, (row) => row.Date !== undefined && row.Balance !== undefined && row.Date !== 'Date' && row.Balance !== 'Balance');
    }).then((results) => {
      // Order by date.
      return _.sortBy(results, (row) => {
        return moment(row.Date, Base.dateFormat).unix();
      });
    }).then((results) => {
      // Remove weird leading apostrophes from the description.
      return _.map(results, (row) => {
        ['Description', 'Account Number', 'Account Name'].forEach((key) => {
          if (row[key].charAt(0) === '\'') {
            row[key] = row[key].slice(1);
          }
        });
        return row;
      });
    }).then((results) => {
      // Add a hash of the row.
      return _.map(results, (row) => {
        row.hash = Base.hash(_.toArray(row).join(''));
        return row;
      });
    });
  }
  /**
   * Get transactions, first attempting from the cache and then from the files.
   *
   * @return {Promise}
   */
  getTransactions () {
    return this.getCache().catch(() => this._getTransactionsFromFiles());
  }
  /**
   * Get all the transactions but grouped by day, month, or whatever is passed.
   *
   * @param {Object} opts
   *   The options, which should contain at least opts.groupBy.
   *
   * @return {Promise}
   */
  getGroupedTransactions (opts = {}) {
    const groupBy = opts.groupBy || 'month';
    return new Promise((resolve, reject) => {
      this.getTransactions().then((results) => {
        const filteredResults = this.filter(results, opts);
        resolve(_.groupBy(filteredResults, (result) => moment(result.Date, Base.dateFormat).startOf(groupBy).format('YYYY-MM-DD')));
      }).error(reject).catch(reject);
    });
  }
  /**
   * Get the stats as grouped by groupBy passed to opts.
   *
   * @todo This is a bit confused. What are stats? Why pass to groupedTrans?
   *
   * @param {Object} opts
   *   The options, same as is passed to getGroupedTransactions.
   *
   * @return {Promise}
   */
  getTransactionStats (opts = {}) {
    return this.getGroupedTransactions(opts).then((groups) => {
      return new Promise((resolve, reject) => {
        const mappedGroups = _.map(groups, (group, key) => {
          const output = {
            incoming: Filter.sumValues(Filter.filterIncoming(group), 'Value', true),
            outgoing: Filter.sumValues(Filter.filterOutgoing(group), 'Value', true),
            balance: Filter.averageValues(group, 'Balance')
          };
          output.net = output.incoming - output.outgoing;
          output.ratio = output.outgoing / output.incoming;
          output.Date = moment(key).format(Base.dateFormat);
          // console.log(output);
          return output;
          // return _.mapValues(output, (val) => {
          //   return isFinite(val) ? val.toFixed(2) : val;
          // });
        });
        resolve(mappedGroups);
      });
    });
  }
}
