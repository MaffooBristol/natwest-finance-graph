'use strict';

import React  from 'react';
import _      from 'lodash';
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

export class Currency extends React.Component {
  componentWillMount () {
    this.setState({currency: '£'});
  }
  render () {
    let thisStyle = _.extend({}, style.currency);
    if (this.props.color) {
      thisStyle.color = this.props.color;
    }
    return <span style={thisStyle}>{this.state.currency}{this.props.value}</span>;
  }
}

export class Balance extends React.Component {
  componentWillMount () {
    this.setState({transactions: []});
    this.props.sockets.transactions.on('transactions:receive', (err, data) => {
      if (err) {
        return console.error(err);
      }
      if (data.id === 'Balance') {
        this.setState({transactions: data.data});
      }
    });
  }
  componentDidMount () {
    this.props.sockets.transactions.emit('transactions:request', {id: 'Balance', filter: 'none'});
  }
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

export class MonthStats extends React.Component {
  componentDidMount () {
    this.props.sockets.stats.emit('stats:request', {id: 'MonthStats', groupBy: 'month'});
    this.props.sockets.stats.on('stats:receive', (err, data) => {
      if (err) {
        return console.error(err.stack);
      }
      if (data.id !== 'MonthStats') {
        return;
      }
      this.setState({stats: data.data});
    });
  }
  render () {
    if (this.state && this.state.stats.length) {
      let inRange = moment(_.last(this.state.stats).Date, 'DD/MM/YYYY').isSameOrAfter(moment().startOf('month'));
      let currencyValue = (key) => inRange ? _.last(this.state.stats)[key] : 0;
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
