'use strict';

import fs       from 'fs';
import _        from 'lodash';
import moment   from 'moment';
import async    from 'async';
import Promise  from 'bluebird';
import farmhash from 'farmhash';

import Base from '../base';
import {Statements, Cache} from './';
import Filter from './Transactions/Filter';

export default class Transactions {

  constructor () {
    this.filter = Filter.filter;
  }

  getCache () {
    return Cache.getCache('transactions');
  }

  setCache () {
    return Cache.setCache('transactions', this._getTransactionsFromFiles);
  }

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
      return _.filter(results, (row) => {
        return (
          row['Date'] !== undefined &&
          row['Balance'] !== undefined &&
          row['Date'] !== 'Date' &&
          row['Balance'] !== 'Balance'
        );
      });
    }).then((results) => {
      // Order by date.
      return _.sortBy(results, (row) => {
        return moment(row['Date'], Base.dateFormat).unix();
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

  getTransactions () {
    return this.getCache().catch(() => this._getTransactionsFromFiles());
  }

  getGroupedTransactions (opts = {}) {
    let groupBy = opts.groupBy || 'month';
    return new Promise((resolve, reject) => {
      this.getTransactions().then((results) => {
        results = this.filter(results, opts);
        resolve(_.groupBy(results, (result) => moment(result['Date'], Base.dateFormat).startOf(groupBy).format('YYYY-MM-DD')));
      }).error(reject).catch(reject);
    });
  }

  getTransactionStats (opts = {}) {
    return this.getGroupedTransactions(opts).then((groups) => {
      return new Promise((resolve, reject) => {
        groups = _.map(groups, (group, key) => {
          let output = {
            incoming: Filter.sumValues(Filter.filterIncoming(group), 'Value'),
            outgoing: Filter.sumValues(Filter.filterOutgoing(group), 'Value'),
            balance: Filter.averageValues(group, 'Balance')
          };
          output.net = output.incoming - output.outgoing;
          output.ratio = output.outgoing / output.incoming;
          output.Date = moment(key).format(Base.dateFormat);
          return _.mapValues(output, (val) => isFinite(val) ? val.toFixed(2) : val);
        });
        resolve(groups);
      });
    });
  }
}
