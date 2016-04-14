'use strict';

const _ = require('lodash');
const table = require('text-table');

const Data = require('./data.js');

module.exports = class List {

  constructor(opts) {
    opts = opts || {};
    opts.filter = opts.filter || null;
    (new Data()).get((data) => {
      if (opts.filter === 'incoming') {
        data = _.filter(data, (val) => Number(val.Value) > 0);
      }
      if (opts.filter === 'outgoing') {
        data = _.filter(data, (val) => Number(val.Value) < 0);
      }
      this.display(data);
    });
  }

  display (data) {
    var output = _.map(data, (val) => [val.Value, val.Date, val.Description]);
    console.log(table(output));
  }

}
