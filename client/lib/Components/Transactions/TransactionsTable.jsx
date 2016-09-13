'use strict';

import React from 'react';
import _     from 'lodash';
import Base  from '../../../../lib/base.js';

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

class TableCell extends React.Component {
  render () {
    return <td style={style.table.row.cell}>{this.props.value}</td>;
  }
}

class TableRow extends React.Component {
  render () {
    const cells = [
      <TableCell value={this.props.cells.Date} />,
      <TableCell value={this.props.cells.Type} />,
      <TableCell value={Base.formatCurrency(this.props.cells.Value)} />,
      <TableCell value={Base.formatCurrency(this.props.cells.Balance)} />,
      <TableCell value={this.props.cells.Description} />
    ];
    return (
      <tr>{cells}</tr>
    );
  }
}

export default class Table extends React.Component {
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
