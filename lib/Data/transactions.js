'use strict';

import walk        from 'walk';
import fs          from 'fs';
import _           from 'lodash';
import {Converter} from 'csvtojson';
import moment      from 'moment';
import async       from 'async';
import Stream      from 'stream';
import Promise     from 'bluebird';
import couchbase   from 'couchbase';

import {Statements} from './index.js';

const cluster = new couchbase.Cluster('couchbase://localhost');

export default class Transactions {

  // Set our transform function that will trim the input data.
  static streamTransformTrim () {
    let parser = new Stream.Transform();
    let trimmed = false;
    parser._transform = function (data, encoding, done) {
      if (trimmed) {
        this.push(data);
        return done();
      }
      trimmed = true;
      this.push(new Buffer(data.toString().trim(), 'utf8'));
      done();
    };
    return parser;
  }

  openBucket () {
    return new Promise((resolve, reject) => {
      if (this.bucket && this.bucket.connected) {
        return resolve(this.bucket);
      }
      this.bucket = cluster.openBucket('finances');
      this.bucket.on('connect', () => {
        resolve(this.bucket);
      });
      this.bucket.on('error', (err) => {
        if (this.bucket && this.bucket.removeEventListener !== undefined) {
          this.bucket.removeEventListener();
        }
        this.bucket = null;
        reject(err);
      });
    });
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
      data = _.filter(data, (val) => {
        return moment(val.Date, 'DD/MM/YYYY').isSameOrAfter(moment(opts.startDate, 'DD/MM/YYYY'));
      });
    }
    if (opts && opts.endDate) {
      data = _.filter(data, (val) => {
        return moment(val.Date, 'DD/MM/YYYY').isSameOrBefore(moment(opts.endDate, 'DD/MM/YYYY'));
      });
    }
    return data;
  }

  getCache () {
    return new Promise((resolve, reject) => {
      this.openBucket().then((bucket) => {
        if (!bucket.connected) {
          return reject(new Error('Could not connect to Couchbase.'));
        }
        bucket.get('transactions', (err, result) => {
          if (err) {
            // Catch "key does not exist on server".
            if (err.code === 13) {
              return this.setCache().then(resolve, reject);
            }
            return reject(err);
          }
          if (!result.value.length) {
            this.setCache().then(resolve, reject);
          }
          else {
            resolve(result.value);
          }
        });
      }).error(reject).catch(reject);
    });
  }

  setCache (data = null) {
    return new Promise((resolve, reject) => {
      this.openBucket().then((bucket) => {
        this._getTransactionsFromFiles().then((results) => {
          if (!bucket.connected) {
            return reject(new Error('Could not connect to Couchbase.'));
          }
          bucket.upsert('transactions', results, (err) => {
            if (err) {
              return reject(err);
            }
            resolve(results);
          });
        }).catch(reject).error(reject);
      }).catch(reject).error(reject);
    });
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
          file.pipe(Transactions.streamTransformTrim()).pipe(csvConverter);
        }, (err, results) => {
          if (err) return reject(err);
          // Merge all files together.
          results = _.flatten(results, true);
          // Ensure rows are unique.
          results = _.uniqBy(results, JSON.stringify);
          // Ensure we have all the required fields.
          results = _.filter(results, (x) => {
            return (
              x['Date'] !== undefined &&
              x['Balance'] !== undefined &&
              x['Date'] !== 'Date' &&
              x['Balance'] !== 'Balance'
            );
          });
          // Order by date.
          results = _.sortBy(results, (x) => {
            return moment(x['Date'], 'DD/MM/YYYY').unix();
          });
          // Remove weird leading apostrophes from the description.
          results = _.map(results, (x) => {
            if (x['Description'].charAt(0) === '\'') {
              x['Description'] = x['Description'].slice(1);
            }
            return x;
          });
          resolve(results);
        });
      });
    });
  }

  getTransactions () {
    return this.getCache().catch(() => {
      return this._getTransactionsFromFiles();
    });
  }

  getGroupedTransactions (opts = {}) {
    let groupBy = opts.groupBy || 'month';
    return new Promise((resolve, reject) => {
      this.getTransactions().then((results) => {
        results = this.filter(results, opts);
        resolve(_.groupBy(results, (result) => moment(result['Date'], 'DD/MM/YYYY').startOf(groupBy).format('YYYY-MM-DD')));
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
          output.Date = moment(key).format('DD/MM/YYYY');
          return _.mapValues(output, (val) => isFinite(val) ? val.toFixed(2) : val);
        });
        resolve(groups);
      });
    });
  }
}
