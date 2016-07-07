import React from 'react';

import Chart from './Chart.jsx';

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {transactions: null};
  }
  componentDidMount() {
    this.socket = io();
    var _start = Date.now();
    this.socket.emit('transactions:request', {filter: 'none'});
    this.socket.on('transactions:receive', (err, data) => {
      if (err) {
        return console.error(err);
      }
      var _gotData = Date.now();
      console.log('Got data in ' + (_gotData - _start) / 1000 + ' seconds');
      this.setState({transactions: data});
      console.log('Rendered in ' + (Date.now() - _gotData) / 1000 + ' seconds');
    });
  }
  render() {
    return (
      <Chart className='finance-chart' transactions={this.state.transactions} />
    );
  }
}
