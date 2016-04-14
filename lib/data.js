'use strict';

const walk      = require('walk');
const fs        = require('fs');
const _         = require('lodash');
const csvtojson = require('csvtojson').core.Converter;
const moment    = require('moment');

module.exports = class Data {

  get (callback) {
    var csvWalker = walk.walk(GLOBAL.paths.CSV_PATH, {followLinks: false});
    var files = [];
    var ret = [];

    csvWalker.on('file', (root, stat, next) => {
      if (stat.name.match(/[A-Z]+?\-\d+?.*?\.csv/gi)) {
        var filename = root + '/' + stat.name;
        files.push(fs.createReadStream(filename));
      }
      next();
    });

    csvWalker.on('end', () => {

      var left = files.length;

      files.forEach((file) => {

        var csvConverter = new csvtojson({constructResult: true});

        csvConverter.on('end_parsed', (data) => {
          if (!callback) return;

          if (--left === 0) {
            ret = ret.concat(data);
            // Ensure rows are unique.
            ret = _.uniqBy(ret, JSON.stringify);
            // Required fields.
            ret = _.filter(ret, (x) => {
              return (
                 x['Date']    !== undefined
              && x['Balance'] !== undefined
              && x['Date']    !== 'Date'
              && x['Balance'] !== 'Balance'
                );
            });
            // Order by date.
            ret = _.sortBy(ret, (x) => {
              return moment(x['Date'], 'DD/MM/YYYY').unix();
            });
            ret = _.map(ret, (x) => {
              if (x['Description'].charAt(0) === '\'') {
                x['Description'] = x['Description'].slice(1);
                return x;
              }
            });
            callback(ret);
          }
          else {
            ret = ret.concat(data);
          }
        });

        file.pipe(csvConverter);
      });
    });

  }
}
