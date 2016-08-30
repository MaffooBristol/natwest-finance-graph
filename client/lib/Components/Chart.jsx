'use strict';

import React   from 'react';
import update  from 'react-addons-update';
import _       from 'lodash';
import Moment  from 'moment';
import Dygraph from 'react-dygraphs';

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
};

export class Chart extends React.Component {

  componentWillMount () {
    this.displayLines = {
      incoming: {label: 'Incoming', color: '#6d6'},
      outgoing: {label: 'Outgoing', color: '#d66'},
      net: {label: 'Net', color: '#6ad'},
      balance: {label: 'Balance', color: '#999'}
    };
    this.setState({groupBy: 'isoWeek'});
    this.props.sockets.stats.on('stats:receive', (err, data) => {
      if (err) {
        console.error(err.stack);
      }
      if (data.id !== 'Chart') {
        return;
      }
      this.setState({stats: data.data});
    });
    this.setState({displayLines: {incoming: true, outgoing: true}});
  }

  componentDidMount () {
    this.loadData();
  }

  loadData (opts) {
    if (opts && opts.groupBy !== undefined) {
      this.setState({groupBy: opts.groupBy});
    }
    // This is required because setState doesn't finish until next tick.
    setTimeout(() => {
      this.props.sockets.stats.emit('stats:request', {id: 'Chart', groupBy: this.state.groupBy});
    }, 500);
  }

  toggleLine (line) {
    this.setState({
      displayLines: update(this.state.displayLines, {
        $merge: {
          [line]: !this.state.displayLines[line]
        }
      })
    });
  }

  render () {
    if (!this.state.stats || !this.state.stats.length) {
      return <div />;
    }

    let graphData = _.map(this.state.stats, (row, index) => {
      let output = [new Date(Moment(row.Date, 'DD/MM/YYYY'))];
      _.each(this.displayLines, (displayLine, key) => {
        if (!this.state.displayLines[key]) {
          return;
        }
        switch (key) {
          case 'incoming':
            output.push(parseFloat(row.incoming));
            break;
          case 'outgoing':
            output.push(-parseFloat(row.outgoing));
            break;
          case 'net':
            output.push(parseFloat(row.net));
            break;
          case 'balance':
            output.push(parseFloat(row.balance));
            break;
          default:
            output.push(0);
            break;
        }
      });
      return output;
    });

    let labels = ['Date'];
    let colors = [];
    let displayLinesButtons = [];

    _.each(this.displayLines, (displayLine, key) => {
      if (this.state.displayLines[key]) {
        labels.push(displayLine.label);
        colors.push(displayLine.color);
      }
      displayLinesButtons.push(
        <button
          style={style.actions.action}
          onClick={this.toggleLine.bind(this, key)}
          key={key}>
          {displayLine.label}
        </button>
      );
    });

    let groupButtons = [];
    [['Day', 'day'], ['Weeks', 'isoWeek'], ['Months', 'month'], ['Year', 'year']].forEach((groupBy) => {
      groupButtons.push(
        <button
          style={style.actions.action}
          disabled={this.state.groupBy === groupBy[1]}
          onClick={this.loadData.bind(this, {groupBy: groupBy[1]})}
          key={groupBy[1]}>
          {groupBy[0]}
        </button>
      );
    });

    return (
      <div>
        <div style={style.actions}>
          <button style={style.actions.action} onClick={this.loadData.bind(this, null)}>Refresh</button>
          {groupButtons}
          {displayLinesButtons}
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
