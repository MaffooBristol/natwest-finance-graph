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

/**
 * TransactionsList class, shows a filterable list of all transactions.
 */
export default class TransactionList extends React.Component {
  /**
   * Extends React.Component.constructor(). Sets default state.
   */
  constructor () {
    super();
    this.state = {initialTransactions: [], transactions: []};
  }
  /**
   * Before the component mounts, listen for transactions on the socket.
   *
   * When it receives data, set the current state and then filter the list.
   */
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
  /**
   * When the component mounts, emit a request for the transactions.
   */
  componentDidMount () {
    this.props.sockets.transactions.emit('transactions:request', {id: 'TransactionsList'});
  }
  /**
   * Filter the transactions data based on the options sent to it.
   *
   * @param {Object} filters
   *   An object containing optional filters, at the moment only string search.
   */
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
    this.setState({transactions: filteredRows});
  }
  /**
   * Filter based on a string search.
   *
   * @param {String} search
   *   The string to search for, transformed to be case-independent.
   */
  handleSearch (search) {
    this.filter({search});
  }
  /**
   * Render out the transactions table, search, pager, anything else, etc.
   *
   * @return {ReactElement}
   */
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
