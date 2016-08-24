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
const bucket = cluster.openBucket('finances');

// Set our transform function that will trim the input data.
const transform = function () {
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
};

export default class Transactions {

  filter (data, opts) {
    if (opts.filter === 'incoming') {
      data = _.filter(data, (val) => Number(val.Value) > 0);
    }
    if (opts.filter === 'outgoing') {
      data = _.filter(data, (val) => Number(val.Value) < 0);
    }
    return data;
  }

  getCache () {
    return new Promise((resolve, reject) => {
      if (!bucket.connected) {
        this.getTransactions().then(resolve).error(reject).catch(reject);
        return;
      }
      bucket.get('transactions', (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result.value);
      });
    });
  }

  setCache () {
    return new Promise((resolve, reject) => {
      this.getTransactions().then((results) => {
        if (!bucket.connected) {
          return reject(new Error('Could not connect to CouchBase'));
        }
        bucket.upsert('transactions', results, (err) => {
          if (err) return reject(err);
          resolve(results);
        });
      });
    });
  }

  getTransactions () {
    return new Promise((resolve, reject) => {
      Statements.getStatements().then((files) => {
        async.map(files, (file, _callback) => {
          var csvConverter = new Converter({
            constructResult: true,
            ignoreEmpty: true
          });
          csvConverter.on('end_parsed', (data) => _callback(null, data));
          file.pipe(transform()).pipe(csvConverter);
        }, (err, results) => {
          if (err) return reject(err);
          // Merge all files together.
          results = _.flatten(results, true);
          // Ensure rows are unique.
          results = _.uniqBy(results, JSON.stringify);
          // Ensure we have all the required fields.
          results = _.filter(results, (x) => {
            return (
              x['Date']    !== undefined &&
              x['Balance'] !== undefined &&
              x['Date']    !== 'Date' &&
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
      }).error(reject).catch(reject);
    });
  }

  getGroupedTransactions (opts = {}) {
    let groupBy = opts.groupBy || 'month';
    return new Promise((resolve, reject) => {
      this.getTransactions().then((results) => {
        resolve(_.groupBy(results, (result) => moment(result['Date'], 'DD/MM/YYYY').startOf(groupBy).format('YYYY-MM-DD')));
      }).error(reject).catch(reject);
    });
  }

  getTransactionStats (opts = {}) {
    return new Promise((resolve, reject) => {
      this.getGroupedTransactions(opts).then((groups) => {
        groups = _.map(groups, (group, key) => {
          let incoming = _.filter(group, (transaction) => parseFloat(transaction['Value']) > 0);
          let outgoing = _.filter(group, (transaction) => parseFloat(transaction['Value']) < 0);
          let output = {
            // allValues: _.map(group, (transaction) => transaction['Value']),
            incoming: _.reduce(incoming, (sum, transaction) => sum + Math.abs(parseFloat(transaction['Value'])), 0),
            outgoing: _.reduce(outgoing, (sum, transaction) => sum + Math.abs(parseFloat(transaction['Value'])), 0),
            balance: _.reduce(group, (sum, transaction) => sum + parseFloat(transaction['Balance']), 0) / group.length
          };
          output.net   = output.incoming - output.outgoing;
          output.ratio = output.outgoing / output.incoming;
          output.Date = moment(key).format('DD/MM/YYYY');
          return _.mapValues(output, (val) => isFinite(val) ? val.toFixed(2) : val);
        });
        resolve(groups);
      });
    });
  }
}
