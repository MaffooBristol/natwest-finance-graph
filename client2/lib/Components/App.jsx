import React from 'react';

import Chart from './Chart.jsx';
import StatementList from './Statements.jsx';
import TransactionList from './Transactions.jsx';

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {
      transactions: [],
      statements: []
    };
  }
  componentDidMount() {
    this.socket = io();
    let _start = Date.now();
    this.socket.emit('transactions:request', {filter: 'none'});
    this.socket.on('transactions:receive', (err, data) => {
      if (err) {
        return console.error(err);
      }
      let _gotData = Date.now();
      console.log('Got transactions in ' + (_gotData - _start) / 1000 + ' seconds');
      this.setState({transactions: data});
      console.log('Rendered in ' + (Date.now() - _gotData) / 1000 + ' seconds');
    });
    this.socket.emit('statements:request');
    this.socket.on('statements:receive', (err, files) => {
      this.setState({statements: files});
    });
  }
  render() {
    return (
      <div>
        <StatementList statements={this.state.statements} />
        <TransactionList transactions={this.state.transactions} />
        <Chart className='finance-chart' transactions={this.state.transactions} />
      </div>
    );
  }
}
