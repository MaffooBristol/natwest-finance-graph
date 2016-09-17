'use strict';

import Stream   from 'stream';
import farmhash from 'farmhash';

/**
 * The base class, providing static and utility functions.
 *
 * I was initially going to get things to extend this class but instead I'm
 * just using the static methods as is to avoid scope issues.
 */
export default class Base {
  /**
   * The default date format, this may be allowed to beoverridden in the future.
   *
   * @type {String}
   */
  static dateFormat = 'DD/MM/YYYY';
  /**
   * Format currency based on the global value or the default.
   *
   * @param {Number (float)} val
   *   The numeric value that will be formatted as currency.
   *
   * @return {String}
   *   String output of the currency, to two decimal places and with symbol.
   */
  static formatCurrency (val, currency = global.currency) {
    return `${currency !== false ? currency : ''}${parseFloat(val).toFixed(2)}`;
  }
  /**
   * Set our transform function that will trim the input data.
   *
   * @return {Object}
   *   A stream transform object.
   */
  static streamTransformTrim () {
    const parser = new Stream.Transform();
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
  /**
   * Simple 32-bit hashing for transaction row comparison and the like.
   *
   * @param {String} inputString
   *   The string input for the hash.
   *
   * @return {String}
   *   Hexacdecimal hash of the string.
   */
  static hash (inputString) {
    return farmhash.hash32(inputString).toString(16);
  }
}
