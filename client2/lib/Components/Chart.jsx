import React from 'react';
import _ from 'lodash';
import Moment from 'moment';
import Dygraph from 'react-dygraphs';

export default class Chart extends React.Component {
  componentDidMount () {
    // Do something on component mount (possibly fetch data?)
    // ... but will have to work out what I'm doing with Redux or Flux or wevz.
  }
  render () {
    var graphData = [[0,0]];
    if (this.props.transactions && this.props.transactions.length) {
      graphData = _.map(this.props.transactions, (row, index) => {
        return [new Date(Moment(row.Date, 'DD/MM/YYYY')), row.Value, row.Balance];
      });
    }
    const labels = ['Date', 'Value', 'Balance'];
    return <Dygraph data={graphData} labels={labels} height={600} width={1200} />;
  }
}
