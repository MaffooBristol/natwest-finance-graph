'use strict';

import walk        from 'walk';
import fs          from 'fs';
import _           from 'lodash';
import {Converter} from 'csvtojson';
import moment      from 'moment';
import async       from 'async';
import Promise     from 'bluebird';
import farmhash    from 'farmhash';

import Base from '../base';

import {Statements, Cache} from './';

export default class Transactions {

  hash (hash) {
    return farmhash.hash32(hash).toString(16);
  }

  getCache () {
    return Cache.getCache('transactions');
  }

  setCache () {
    return Cache.setCache('transactions', this._getTransactionsFromFiles);
  }

  filter (data, opts) {
    if (opts.filter && !!~['incoming', 'outgoing'].indexOf(opts.filter)) {
      let multiplier = opts.filter === 'incoming' ? 1 : -1;
      data = _.filter(data, (val) => Number(val.Value) * multiplier > 0);
    }
    if (opts && opts.exclusions && opts.exclusions.length) {
      data = _.filter(data, (val) => {
        return !_.filter(opts.exclusions, (exclusion) => {
          return !!~val.Description.toLowerCase().indexOf(exclusion.toLowerCase());
        }).length;
      });
    }
    if (opts && opts.startDate) {
      data = _.filter(data, (val) => moment(val.Date, Base.dateFormat).isSameOrAfter(moment(opts.startDate, Base.dateFormat)));
    }
    if (opts && opts.endDate) {
      data = _.filter(data, (val) => moment(val.Date, Base.dateFormat).isSameOrBefore(moment(opts.endDate, Base.dateFormat)));
    }
    return data;
  }

  _getTransactionsFromFiles () {
    return Statements.getStatements().then((files) => {
      return new Promise((resolve, reject) => {
        async.map(files, (file, _callback) => {
          var csvConverter = new Converter({
            constructResult: true,
            ignoreEmpty: true
          });
          csvConverter.on('end_parsed', (data) => _callback(null, data));
          file.pipe(Base.streamTransformTrim()).pipe(csvConverter);
        }, (err, results) => {
          if (err) return reject(err);
          // Merge all files together.
          results = _.flatten(results, true);
          // Ensure rows are unique.
          results = _.uniqBy(results, JSON.stringify);
          // Ensure we have all the required fields.
          results = _.filter(results, (row) => {
            return (
              row['Date'] !== undefined &&
              row['Balance'] !== undefined &&
              row['Date'] !== 'Date' &&
              row['Balance'] !== 'Balance'
            );
          });
          // Order by date.
          results = _.sortBy(results, (row) => {
            return moment(row['Date'], Base.dateFormat).unix();
          });
          // Remove weird leading apostrophes from the description.
          results = _.map(results, (row) => {
            ['Description', 'Account Number', 'Account Name'].forEach((key) => {
              if (row[key].charAt(0) === '\'') {
                row[key] = row[key].slice(1);
              }
            });
            return row;
          });
          // Add a hash of the row.
          results = _.map(results, (row) => {
            row.hash = this.hash(_.toArray(row).join(' / '));
            return row;
          });
          resolve(results);
        });
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

  filterValues (values, multiplier) {
    return _.filter(values, (transaction) => parseFloat(transaction['Value']) * multiplier > 0);
  }

  filterIncoming (values) {
    return this.filterValues(values, 1);
  }

  filterOutgoing (values) {
    return this.filterValues(values, -1);
  }

  sumValues (data, key) {
    return _.reduce(data, (sum, transaction) => sum + Math.abs(parseFloat(transaction[key])), 0);
  }

  averageValues (data, key) {
    return this.sumValues(data, key) / data.length;
  }

  getTransactionStats (opts = {}) {
    return this.getGroupedTransactions(opts).then((groups) => {
      return new Promise((resolve, reject) => {
        groups = _.map(groups, (group, key) => {
          let output = {
            incoming: this.sumValues(this.filterIncoming(group), 'Value'),
            outgoing: this.sumValues(this.filterOutgoing(group), 'Value'),
            balance: this.averageValues(group, 'Balance')
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
