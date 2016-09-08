'use strict';

import React from 'react';
import _     from 'lodash';

import Table  from './TransactionsTable.jsx';
import Search from './TransactionsSearch.jsx';

const style = {
  tableContainer: {
    width: '100%',
    height: '400px',
    overflowY: 'scroll',
    background: 'white',
    marginBottom: '40px'
  }
};

export default class TransactionList extends React.Component {
  constructor () {
    super();
    this.state = {initialTransactions: [], transactions: []};
  }
  componentWillMount () {
    this.props.sockets.transactions.on('transactions:receive', (err, data) => {
      if (err) {
        return console.error(err);
      }
      if (data.id === 'TransactionsList') {
        this.setState({initialTransactions: data.data});
        this.filter();
      }
    });
  }
  componentDidMount () {
    this.props.sockets.transactions.emit('transactions:request', {id: 'TransactionsList'});
  }
  filter (filters = {}) {
    let filteredRows = this.state.initialTransactions;
    filteredRows = _.filter(filteredRows, (row, index) => {
      let match = true;
      if (filters.search !== undefined && filters.search.length) {
        if (!~row.Description.toLowerCase().indexOf(filters.search.toLowerCase())) {
          match = false;
        }
      }
      return match;
    });
    filteredRows = _.reverse(filteredRows).splice(0, 100);
    return this.setState({transactions: filteredRows});
  }
  handleSearch (search) {
    this.filter({search: search});
  }
  render () {
    return (
      <div>
        <div>
          <Search handleSearch={this.handleSearch.bind(this)} />
        </div>
        <div style={style.tableContainer}>
          <Table rows={this.state.transactions} initRows={this.state.initialTransactions} />
        </div>
      </div>
    );
  }
}
