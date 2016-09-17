'use strict';

import React  from 'react';
import update from 'react-addons-update';
import _      from 'lodash';
import Siofu  from 'socketio-file-upload';

import {Chart}         from './Chart.jsx';
import {Balance}       from './Extras.jsx';
import StatementList   from './Statements.jsx';
import TransactionList from './Transactions/Transactions.jsx';

const styles = {
  leftBar: {
    position: 'fixed',
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

/**
 * Main application component that will be attached to the DOM.
 *
 * This is rendered out and attached in main.jsx
 */
export default class App extends React.Component {
  /**
   * Extends React.Component.constructor(). Sets default state.
   */
  constructor () {
    super();
    this.state = {
      transactions: [],
      statements: [],
      stats: []
    };
  }
  /**
   * Set up the component to accept incoming connections and other things.
   */
  componentWillMount () {
    this.attachSockets();
    this.sockets.statements.on('statements:receive', _.throttle((err, files) => {
      if (err) return console.error(err.stack);
      this.setState({statements: files});
    }, 1000, {leading: false}));
  }
  /**
   * Create socket connections, channels and other io bits.
   */
  attachSockets () {
    // Define the global window socket.io connection.
    this.socket = window.io();
    // Create our socket channels.
    this.sockets = {};
    this.sockets.statements = window.io('/statements');
    this.sockets.transactions = window.io('/transactions');
    this.sockets.stats = window.io('/stats');
    // Listen for error events for each socket.io channel.
    _.each(this.sockets, (socket) => {
      socket.on('client:error', (err) => alert(err));
    });
    // Define a SIOFU connection for uploading statements.
    this.statementUploader = new Siofu(this.sockets.statements);
  }
  /**
   * Render the main application interface.
   *
   * At the moment this is pretty verbose but I'd rather split it up, especially
   * when it comes to routing and more complex stuff.
   *
   * @return {ReactElement}
   */
  render () {
    return (
      <div>
        <div style={styles.leftBar}>
          <StatementList sockets={this.sockets} statements={this.state.statements} statementUploader={this.statementUploader} />
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
