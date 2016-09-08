'use strict';

export default class Base {
  static formatCurrency (val) {
    return `${global.currency || '£'}${parseFloat(val).toFixed(2)}`;
  }
}
