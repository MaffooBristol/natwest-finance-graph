'use strict';

import React from 'react';
import _ from 'lodash';
import moment from 'moment';

const style = {
  currency: {
    color: '#69c',
    size: '1.3rem',
    fontWeight: '500'
  },
  balance: {
    textAlign: 'right',
    borderBottom: '1px solid #bbb',
    paddingBottom: 10,
    marginBottom: 10
  }
};

/**
 * Currency class, returns a styled JSX output of a value as currency.
 */
export class Currency extends React.Component {
  /**
   * Extends React.Component.constructor(). Sets default state.
   */
  constructor () {
    super();
    this.state = { symbol: '£' };
  }
  /**
   * Renders the currency with the correct colours and symbol.
   *
   * @return {ReactComponent}
   */
  render () {
    const thisStyle = _.extend({}, style.currency);
    if (this.props.color) {
      thisStyle.color = this.props.color;
    }
    return <span style={thisStyle}>{this.state.symbol}{this.props.value}</span>;
  }
}

/**
 * Balance class, shows the current balance. How much money you do/don't have.
 *
 * This is kinda a bit pointless as a component, or at least needs to be used
 * in a more worthwhile way.
 */
export class Balance extends React.Component {
  /**
   * Extends React.Component.constructor(). Sets default state.
   */
  constructor () {
    super();
    this.state = { transactions: [] };
  }
  /**
   * Before the component mounts, listen for transaction socket events and
   * set the state accordingly.
   */
  componentWillMount () {
    this.props.sockets.transactions.on('transactions:receive', (err, data) => {
      if (err) {
        return console.error(err);
      }
      if (data.id === 'Balance') {
        this.setState({ transactions: data.data });
      }
    });
  }
  /**
   * After the component mounts, send the request for the transactions.
   *
   * @todo: This should take a single item from a tailored socket rather than
   * get all transactions and filter them in the front-end. This whole system
   * is meant to be server-first, so this kinda breaks that paradigm.
   */
  componentDidMount () {
    this.props.sockets.transactions.emit('transactions:request', { id: 'Balance', filter: 'none' });
  }
  /**
   * Render out the current balance, with the currency formatted.
   *
   * @return {ReactElement}
   */
  render () {
    if (this.state.transactions.length && _.last(this.state.transactions)) {
      return (
        <div style={style.balance}>
          <MonthStats sockets={this.props.sockets} /> &nbsp;
          <span>Balance: <Currency value={_.last(this.state.transactions).Balance} /></span>
        </div>
      );
    }
    return <div />;
  }
}

/**
 * Show the stats for the current month, incoming, outgoing, net, etc.
 *
 * @todo: Make this more generic so that it can work for any length of time.
 */
export class MonthStats extends React.Component {
  /**
   * After the component mounts, get the stats grouped by month.
   */
  componentDidMount () {
    this.props.sockets.stats.emit('stats:request', { id: 'MonthStats', groupBy: 'month' });
    this.props.sockets.stats.on('stats:receive', (err, data) => {
      if (err) {
        return console.error(err.stack);
      }
      if (data.id !== 'MonthStats') {
        return;
      }
      this.setState({ stats: data.data });
    });
  }
  /**
   * Render out the list of stats for the month, or at least relevant ones.
   */
  render () {
    if (this.state && this.state.stats.length) {
      const inRange = moment(_.last(this.state.stats).Date, 'DD/MM/YYYY').isSameOrAfter(moment().startOf('month'));
      const currencyValue = (key) => inRange ? _.last(this.state.stats)[key] : 0;
      return (
        <span>
          <span>This month: &nbsp;</span>
          <span><Currency value={currencyValue('incoming')} color='green' /></span> &nbsp;
          <span><Currency value={currencyValue('outgoing')} color='red' /></span>
        </span>
      );
    }
    return <span />;
  }
}
