'use strict';

import React    from 'react';
import _        from 'lodash';
import Moment   from 'moment';
import Dygraph  from 'react-dygraphs';
import {Button} from 'react-bootstrap';

const averageWidth = 200;

const style = {
  backgroundColor: 'white',
  fontFamily: 'Helvetica, Arial, sans-serif',
  padding: '20px',
  border: '1px solid #ccc',
  actions: {
    marginBottom: 10,
    action: {
      display: 'inline-block',
      marginRight: 5
    }
  }
}

export class Chart extends React.Component {
  componentDidMount () {
    this.props.socket.emit('transactions:request', {filter: 'none'});
  }
  render () {
    let graphData = [[0,0,0]];
    if (this.props.transactions && this.props.transactions.length) {
      let balances = _.map(this.props.transactions, 'Balance');
      graphData = _.map(this.props.transactions, (row, index) => {
        let _avg = _.filter(_.slice(balances, (index - averageWidth) > -1 ? index - averageWidth : 0, index + averageWidth + 1));
        let rollingAverage = _avg.reduce((a, b) => a + b, 0) / _avg.length;
        return [new Date(Moment(row.Date, 'DD/MM/YYYY')), parseFloat(row.Balance), parseFloat(rollingAverage)];
      });
    }
    const labels = ['Date', 'Balance', 'Rolling Average'];
    const colors = ['#6ad', '#acf'];
    return (
      <div style={style}>
        <Dygraph data={graphData}
        labels={labels}
        height={600}
        colors={colors}
        gridLineColor={'#ddd'}
        axisLabelColor={'#666'}
        axisLineColor={'#666'}
        axisLabelFontSize={11}
        underlayCallback={this.underlayCallback}
        />
      </div>
    );
  }
}

export class Chart2 extends React.Component {
  componentWillMount () {
    this.setState({opts: {groupBy: 'isoWeek'}})
  }
  componentDidMount () {
    this.loadData();
  }
  loadData (opts) {
    if (opts) {
      this.setState({opts: opts});
    }
    // This is required because setState doesn't finish until next tick.
    setTimeout(() => {
      this.props.socket.emit('stats:request', this.state.opts);
    });
  }
  render () {
    let graphData = [[0,0,0,0]];
    if (this.props.stats && this.props.stats.length) {
      graphData = _.map(this.props.stats, (row, index) => {
        return [new Date(Moment(row.Date, 'DD/MM/YYYY')), parseFloat(row.net), parseFloat(row.incoming), -parseFloat(row.outgoing)];
      });
    }
    const labels = ['Date', 'Net', 'Incoming', 'Outgoing'];
    const colors = ['#6ad', '#6d6', '#d66'];
    return (
      <div>
        <div style={style.actions}>
          <button style={style.actions.action} onClick={this.loadData.bind(this, null)}>Refresh</button>
          <button style={style.actions.action} disabled={this.state.opts.groupBy === 'day'} onClick={this.loadData.bind(this, {groupBy: 'day'})}>Days</button>
          <button style={style.actions.action} disabled={this.state.opts.groupBy === 'isoWeek'} onClick={this.loadData.bind(this, {groupBy: 'isoWeek'})}>Weeks</button>
          <button style={style.actions.action} disabled={this.state.opts.groupBy === 'month'} onClick={this.loadData.bind(this, {groupBy: 'month'})}>Months</button>
        </div>
        <div style={style}>
          <Dygraph data={graphData}
          labels={labels}
          height={600}
          colors={colors}
          gridLineColor={'#ddd'}
          axisLabelColor={'#666'}
          axisLineColor={'#666'}
          axisLabelFontSize={11}
          />
        </div>
      </div>
    );
  }
}
