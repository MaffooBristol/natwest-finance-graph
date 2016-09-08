'use strict';

import React from 'react';
import _     from 'lodash';
import Base  from '../../../lib/base.js';

const style = {
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
    let cells = [
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

class Table extends React.Component {
  render () {
    return (
      <table style={style.table}>
        <thead style={style.table.header}>
          {_.map(['Date', 'Type', 'Value', 'Balance', 'Description'], (key) => {
            return <th style={style.table.header.cell}>{key}</th>;
          })}
        </thead>
        <tbody>
          {_.map(this.props.rows, (row) => <TableRow cells={row} />)}
        </tbody>
      </table>
    );
  }
}

export default class TransactionList extends React.Component {

  constructor () {
    super();
    this.state = {transactions: []};
  }

  componentWillMount () {
    this.props.sockets.transactions.on('transactions:receive', (err, data) => {
      if (err) {
        return console.error(err);
      }
      if (data.id === 'TransactionsList') {
        this.setState({transactions: _.reverse(data.data).splice(0, 100)});
      }
    });
  }

  componentDidMount () {
    this.props.sockets.transactions.emit('transactions:request', {id: 'TransactionsList'});
  }

  render () {
    if (!this.state.transactions.length) return null;
    // Date, Type, Description, Value, Balance, Account Name, Account Number
    return (
      <div>
        <Table rows={this.state.transactions} />
      </div>
    );
  }
}
