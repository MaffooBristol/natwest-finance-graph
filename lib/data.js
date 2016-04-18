'use strict';

const walk      = require('walk');
const fs        = require('fs');
const _         = require('lodash');
const csvtojson = require('csvtojson').Converter;
const moment    = require('moment');
const async     = require('async');
const stream    = require('stream');

// Set our transform function that will trim the input data.
const transform = function () {
  var parser = new require('stream').Transform(), trimmed = false;
  parser._transform = function (data, encoding, done) {
    if (trimmed) {
      this.push(data);
      return done();
    }
    trimmed = true;
    this.push(new Buffer(data.toString().trim(), 'utf8'));
    done();
  }
  return parser;
}

module.exports = class Data {

  filter (data, opts) {
    if (opts.filter === 'incoming') {
      data = _.filter(data, (val) => Number(val.Value) > 0);
    }
    if (opts.filter === 'outgoing') {
      data = _.filter(data, (val) => Number(val.Value) < 0);
    }
    return data;
  }

  get (callback) {
    var csvWalker = walk.walk(GLOBAL.paths.CSV_PATH, {followLinks: false});
    var files = [];

    csvWalker.on('file', (root, stat, next) => {
      if (stat.name.match(/[A-Z]+?\-\d+?.*?\.csv/gi)) {
        var filename = root + '/' + stat.name;
        files.push(fs.createReadStream(filename));
      }
      next();
    });

    csvWalker.on('end', () => {
      async.map(files, (file, _callback) => {
        var csvConverter = new csvtojson({constructResult: true, ignoreEmpty: true});
        csvConverter.on('end_parsed', (data) => _callback(null, data));
        file.pipe(transform()).pipe(csvConverter);
      }, (err, results) => {
        // Merge all files together.
        results = _.flatten(results, true);
        // Ensure rows are unique.
        results = _.uniqBy(results, JSON.stringify);
        // Ensure we have all the required fields.
        results = _.filter(results, (x) => {
          return (
             x['Date']    !== undefined
          && x['Balance'] !== undefined
          && x['Date']    !== 'Date'
          && x['Balance'] !== 'Balance'
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
            return x;
          }
        });
        callback(results);
      });
    });

  }
}
