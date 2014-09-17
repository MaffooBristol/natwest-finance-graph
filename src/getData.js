var walk      = require('walk');
var fs        = require('fs');
var _         = require('underscore')._;
var csvtojson = require('csvtojson').core.Converter;
var moment    = require('moment');

exports.get = function (callback) {

  var csvWalker = walk.walk('./place-csvs-here', {followLinks: false});
  var files = [];
  var ret = [];

  csvWalker.on('file', function (root, stat, next) {
    if (stat.name.match(/[A-Z]+?\-\d+?.*?\.csv/gi)) {
      var filename = root + '/' + stat.name;
      files.push(fs.createReadStream(filename));
    }
    next();
  });

  csvWalker.on('end', function () {

    var left = files.length;

    files.forEach(function (file) {

      var csvConverter = new csvtojson({constructResult: true});

      csvConverter.on('end_parsed', function (data) {
        if (callback) {
          if (--left === 0) {
            // Ensure rows are unique.
            ret = _.uniq(ret, function (x) {
              return JSON.stringify(x);
            });
            // Required fields.
            ret = _.filter(ret, function (x) {
              return (
                 x['Date']    !== undefined
              && x['Balance'] !== undefined
              && x['Date']    !== 'Date'
              && x['Balance'] !== 'Balance'
                );
            });
            // Order by date.
            ret = _.sortBy(ret, function (x) {
              return moment(x['Date'], 'DD/MM/YYYY').unix();
            });
            callback(ret);
          }
          else {
            ret = ret.concat(data);
          }
        }
      });

      file.pipe(csvConverter);
    });
  });

}
