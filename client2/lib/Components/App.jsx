'use strict';

import React  from 'react';
import update from 'react-addons-update';
import _      from 'lodash';
import Siofu  from 'socketio-file-upload';

import {Chart, Chart2} from './Chart.jsx';
import StatementList   from './Statements.jsx';
import TransactionList from './Transactions.jsx';

const styles = {
  leftBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 240,
    height: '100%',
    background: 'white',
    borderRight: '1px solid #ddd',
    overflow: 'hidden',
    overflowY: 'scroll'
  },
  mainContent: {
    marginLeft: 240
  }
};

export default class App extends React.Component {
  constructor () {
    super();
    this.state = {
      transactions: [],
      statements: [],
      stats: []
    };
  }
  componentWillMount () {
    this.socket = window.io();
    this.uploader = new Siofu(this.socket);
    this.socket.on('transactions:receive', (err, data) => {
      if (err) {
        return console.error(err);
      }
      let chunkSize = 1000;
      let currentChunk = 0;
      let interval = setInterval(() => {
        this.setState({transactions: update(this.state.transactions, {$push: data.slice(currentChunk, currentChunk + chunkSize)})});
        if (currentChunk >= data.length) {
          return clearInterval(interval);
        }
        currentChunk += chunkSize;
      }, 200);
    });
    this.socket.on('statements:receive', _.throttle((err, files) => {
      if (err) {
        console.error(err.stack);
      }
      this.setState({statements: files});
    }, 1000, {leading: false}));
    this.socket.on('stats:receive', (err, data) => {
      if (err) {
        console.error(err.stack);
      }
      this.setState({stats: data});
    });
  }
  onDrop = (files) => {
    this.uploader.submitFiles(files);
    this.uploader.addEventListener('error', () => {
      // @todo: Handle errors.
    });
  }
  // @todo: Put this into the render function JSX when not so buggy:
  // <TransactionList socket={this.socket} transactions={this.state.transactions} />
  // @todo: Allow this to be placed in without interacting negatively:
  // <Chart socket={this.socket} className='finance-chart' id='chart-1' transactions={this.state.transactions} />
  render () {
    return (
      <div>
        <div style={styles.leftBar}>
          <StatementList socket={this.socket} statements={this.state.statements} onDrop={this.onDrop} />
        </div>
        <div style={styles.mainContent}>
          <Chart2 socket={this.socket} className='finance-chart' id='chart-2' stats={this.state.stats} />
        </div>
      </div>
    );
  }
}
