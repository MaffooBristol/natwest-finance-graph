'use strict';

import _       from 'lodash';
import moment  from 'moment';
import async   from 'async';
import Promise from 'bluebird';

import Base from '../../base';

export default class TransactionsFilter {
  static filter (data, opts) {
    if (opts.filter && !!~['incoming', 'outgoing'].indexOf(opts.filter)) {
      const multiplier = opts.filter === 'incoming' ? 1 : -1;
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
        return moment(val.Date, Base.dateFormat).isSameOrAfter(moment(opts.startDate, Base.dateFormat));
      });
    }
    if (opts && opts.endDate) {
      data = _.filter(data, (val) => {
        return moment(val.Date, Base.dateFormat).isSameOrBefore(moment(opts.endDate, Base.dateFormat));
      });
    }
    return data;
  }
  static filterValues (values, multiplier) {
    return _.filter(values, (transaction) => parseFloat(transaction['Value']) * multiplier > 0);
  }
  static filterIncoming (values) {
    return TransactionsFilter.filterValues(values, 1);
  }
  static filterOutgoing (values) {
    return TransactionsFilter.filterValues(values, -1);
  }
  static sumValues (data, key) {
    return _.reduce(data, (sum, transaction) => sum + Math.abs(parseFloat(transaction[key])), 0);
  }
  static averageValues (data, key) {
    return TransactionsFilter.sumValues(data, key) / data.length;
  }
}
