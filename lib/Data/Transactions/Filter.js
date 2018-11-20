'use strict';

import _ from 'lodash';
import moment from 'moment';
import async from 'async';
import Promise from 'bluebird';

import Base from '../../base';

/**
 * Static methods to filter the transactions based on passed-in arguments.
 */
export default class TransactionsFilter {
  /**
   * Receives a data array and filter options, and returns the filtered data.
   *
   * @todo Make this less shit
   *
   * @param {Array} _data
   *   The transactions data as an array.
   * @param {Object} opts
   *   Options, which may need to be cleaned/pruned. Filter by date, etc.
   *
   * @return {Array}
   *   A filtered list of data.
   */
  static filter (_data = [], opts = {}) {
    // Intentionally doing this in order to not reassign function parameters
    // which is a big no-no according to airbnb, so fair play. But this function
    // is super ugly and I'd rather streamline it somehow, but I think turning
    // it into a promise seems slightly... overkill.
    let data = _data;
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
    if (opts && opts.inclusions && opts.inclusions.length) {
      data = _.filter(data, (val) => {
        return _.filter(opts.inclusions, (exclusion) => {
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
  /**
   * Generic method to filter by incoming/outgoing.
   *
   * @param {Array} data
   *   The array of transactions data.
   * @param {Number (int)} mlt
   *   Either 1 for incoming or -1 for outgoing.
   *
   * @return {Array}
   *   Filtered transactions data.
   */
  static filterByValue (data = [], mlt = 1) {
    return _.filter(data, trns => parseFloat(trns.Value) * mlt > 0);
  }
  /**
   * Filter transactions by only those with positive 'Value' values.
   *
   * @param {Array} data
   *   The array of transactions data.
   *
   * @return {Array}
   *   Filtered transactions data.
   */
  static filterIncoming (data = []) {
    return TransactionsFilter.filterByValue(data, 1);
  }
  /**
   * Filter transactions by only those with negative 'Value' values.
   *
   * @param {Array} data
   *   The array of transactions data.
   *
   * @return {Array}
   *   Filtered transactions data.
   */
  static filterOutgoing (data = []) {
    return TransactionsFilter.filterByValue(data, -1);
  }
  /**
   * Get the sum of the values in the transactions.
   *
   * @param {Array} data
   *   The array of transactions data.
   * @param {String} key
   *   The key of the data value we're checking against.
   * @param {Boolean} absolute
   *   Whether to transform the number to an absolute value.
   *
   * @return {Number (float)}
   *   The sum of the values.
   */
  static sumValues (data = [], key = 'Value', absolute = false) {
    // Check the key exists in the first row of our data.
    // if (data.length) {
    //   return 0;
    // }
    const mappedData = _.map(data, (trns) => {
      // if (!_.isNumber(trns[key])) {
      //   return 0;
      // }
      if (absolute) trns[key] = Math.abs(trns[key]);
      return trns;
    });
    return _.reduce(mappedData, (sum, trns) => sum + parseFloat(trns[key]), 0);
  }
  /**
   * Get the averaged sum of the values in the transactions.
   *
   * @param {Array} data
   *   The array of transactions data.
   * @param {String} key
   *   The key of the data value we're checking against.
   *
   * @return {Number (float)}
   *   The averaged sum of the values.
   */
  static averageValues (data = [], key = 'Value') {
    return TransactionsFilter.sumValues(data, key) / data.length;
  }
}
