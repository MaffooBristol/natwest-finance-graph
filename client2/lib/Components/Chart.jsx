import React from 'react';
import _ from 'lodash';
import Moment from 'moment';
import Dygraph from 'react-dygraphs';
import {Button} from 'react-bootstrap';

const averageWidth = 200;

export default class Chart extends React.Component {
  componentDidMount () {
    // Do something on component mount (possibly fetch data?)
    // ... but will have to work out what I'm doing with Redux or Flux or wevz.
  }
  render () {
    let graphData = [[0,0,0]];
    if (this.props.transactions && this.props.transactions.length) {
      let balances = _.map(this.props.transactions, 'Balance');
      graphData = _.map(this.props.transactions, (row, index) => {
        let _avg = _.filter(_.slice(balances, (index - averageWidth) > -1 ? index - averageWidth : 0, index + averageWidth + 1));
        let rollingAverage = _avg.reduce((a, b) => a + b, 0) / _avg.length;
        return [new Date(Moment(row.Date, 'DD/MM/YYYY')), row.Balance, rollingAverage];
      });
    }
    const labels = ['Date', 'Balance', 'Rolling Average'];
    const chartStyle = {
      backgroundColor: 'white',
      fontFamily: 'Helvetica, Arial, sans-serif',
      padding: '20px',
      border: '1px solid #ccc'
    }
    const colors = ['#6ad', '#acf']
    return (
      <div style={chartStyle}>
        <Dygraph data={graphData} labels={labels} height={600} colors={colors} gridLineColor={'#ddd'} axisLabelColor={'#666'} axisLineColor={'#666'} axisLabelFontSize={11} />
      </div>
    );
  }
}
