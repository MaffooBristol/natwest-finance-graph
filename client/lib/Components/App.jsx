'use strict';

import React  from 'react';
import update from 'react-addons-update';
import _      from 'lodash';
import Siofu  from 'socketio-file-upload';

import {Chart}         from './Chart.jsx';
import {Balance}       from './Extras.jsx';
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

    this.sockets              = {};
    this.sockets.statements   = window.io('/statements');
    this.sockets.transactions = window.io('/transactions');
    this.sockets.stats        = window.io('/stats');

    _.each(this.sockets, (socket) => {
      socket.on('client:error', (err) => {
        alert(err);
      });
    });

    this.uploader = new Siofu(this.sockets.statements);

    this.sockets.statements.on('statements:receive', _.throttle((err, files) => {
      if (err) {
        console.error(err.stack);
      }
      this.setState({statements: files});
    }, 1000, {leading: false}));
  }
  onDrop = (files) => {
    this.uploader.submitFiles(files);
    this.uploader.addEventListener('error', (err) => {
      alert(`Error: ${err.message}`);
    });
  }
  // @todo: Put this into the render function JSX when not so buggy:
  // <TransactionList sockets={this.sockets} />
  render () {
    return (
      <div>
        <div style={styles.leftBar}>
          <StatementList sockets={this.sockets} statements={this.state.statements} onDrop={this.onDrop} />
        </div>
        <div style={styles.mainContent}>
          <Balance sockets={this.sockets} />
          <Chart sockets={this.sockets} className='finance-chart' id='chart' />
          <TransactionList sockets={this.sockets} />
        </div>
      </div>
    );
  }
}
