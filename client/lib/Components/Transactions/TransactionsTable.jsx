'use strict';

import React from 'react';
import _     from 'lodash';

const style = {
  loading: {
    textAlign: 'center',
    paddingTop: '20%',
    color: '#999'
  },
  table: {
    fontSize: '0.8em',
    width: '100%',
    borderCollapse: 'collapse',
    header: {
      cell: {
        padding: '5px 8px',
        background: '#ddd',
        border: '1px solid #aaa'
      }
    },
    row: {
      border: '1px solid #aaa',
      cell: {
        padding: '5px 8px',
        background: 'white',
        border: '1px solid #ddd'
      }
    }
  }
};

/**
 * Transactions data table cell.
 */
class TableCell extends React.Component {
  /**
   * Returns a single cell with the "value" taken in from the props.
   *
   * @return {ReactElement}
   */
  render () {
    return <td style={style.table.row.cell}>{this.props.value}</td>;
  }
}

/**
 * Transactions data table row.
 */
class TableRow extends React.Component {
  /**
   * Format currency based on the global value or the default.
   *
   * @param {Number (float)} val
   *   The numeric value that will be formatted as currency.
   *
   * @return {String}
   *   String output of the currency, to two decimal places and with symbol.
   */
  static formatCurrency (val, currency = '£') {
    return `${currency !== false ? currency : ''}${parseFloat(val).toFixed(2)}`;
  }
  /**
   * Returns a single table row with the "cells" taken in from the props.
   *
   * @return {ReactElement}
   */
  render () {
    return (
      <tr>
        <TableCell value={this.props.cells.Date} />
        <TableCell value={this.props.cells.Type} />
        <TableCell value={TableRow.formatCurrency(this.props.cells.Value)} />
        <TableCell value={TableRow.formatCurrency(this.props.cells.Balance)} />
        <TableCell value={this.props.cells.Description} />
      </tr>
    );
  }
}

/**
 * Transactions data table; this is the default export of this class.
 */
export default class Table extends React.Component {
  /**
   * Returns the data table.
   *
   * @return {ReactElement}
   */
  render () {
    if (!this.props.initRows.length) {
      return <div style={style.loading}>Loading transactions table...</div>;
    }
    return (
      <table style={style.table}>
        <thead style={style.table.header}>
          {_.map(['Date', 'Type', 'Value', 'Balance', 'Description'], (key) => {
            return <th style={style.table.header.cell} key={key}>{key}</th>;
          })}
        </thead>
        <tbody>
          {_.map(this.props.rows, (row, index) => <TableRow cells={row} key={index} />)}
        </tbody>
      </table>
    );
  }
}
