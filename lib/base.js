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
   * @type {string}
   */
  static dateFormat = 'DD/MM/YYYY';
  /**
   * Format currency based on the global value or the default.
   *
   * This should allow for React to access it and get the global currency too,
   * but that doesn't currently work, hence the default.
   *
   * Also it's completely unaware of various currencies like Yen at the moment.
   *
   * @param {float} val
   *   The numeric value that will be formatted as currency.
   *
   * @return {string}
   *   String output of the currency, to two decimal places and with symbol.
   */
  static formatCurrency (val) {
    return `${global.currency || '£'}${parseFloat(val).toFixed(2)}`;
  }
  /**
   * Set our transform function that will trim the input data.
   *
   * @return {object}
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
   * @param {string} inputString
   *   The string input for the hash.
   *
   * @return {string}
   *   Hexacdecimal hash of the string.
   */
  static hash (inputString) {
    return farmhash.hash32(inputString).toString(16);
  }
}
