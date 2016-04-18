import React from 'react';

import Chart from './Chart.jsx';

export default class App extends React.Component {
  constructor() {
    super();
    this.state = {transactions: null};
  }
  componentDidMount() {
    this.socket = io();
    this.socket.emit('transactions:get', {filter: 'none'}, (err, data) => {
      if (err) {
        return console.error(err);
      }
      this.setState({transactions: data});
    });
  }
  render() {
    return (
      <Chart className='finance-chart' transactions={this.state.transactions} />
    );
  }
}
