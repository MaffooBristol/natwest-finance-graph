'use strict';

// This is shit atm because all the table modules aren't very good.

import React from 'react';
import _ from 'lodash';
import {Table, Column, Cell} from 'fixed-data-table';

const TextCell = ({rowIndex, data, col, ...props}) => {
  let cellData = data[rowIndex][col];
  let {toFixed, ...rest} = props;
  if (toFixed !== undefined && toFixed) {
    cellData = cellData.toFixed(toFixed);
  }
  return (
    <Cell {...rest}>
      {cellData}
    </Cell>
  );
};

export default class TransactionList extends React.Component {

  constructor () {
    super();
    this.state = {transactions: []};
  }

  componentWillMount () {
    this.props.sockets.transactions.on('transactions:receive', (err, data) => {
      if (err) {
        return console.error(err);
      }
      if (data.id === 'TransactionsList') {
        this.setState({transactions: data.data.splice(0, 100)});
      }
    });
  }

  componentDidMount () {
    this.props.sockets.transactions.emit('transactions:request', {id: 'TransactionsList'});
  }

  render () {
    if (!this.state.transactions.length) return null;
    // Date, Type, Description, Value, Balance, Account Name, Account Number
    let style = {
      fontSize: '0.8em'
    };
    // let transactions = _.reverse(this.state.transactions);
    // console.log(_.first(this.state.transactions), _.first(transactions));
    return (
      <div>
        <Table
          rowHeight={25}
          rowsCount={this.state.transactions.length}
          headerHeight={35}
          width={1000}
          height={500}
          style={style}
          {...this.props}>
          <Column
            header={<Cell>Date</Cell>}
            cell={<TextCell data={this.state.transactions} col='Date' />}
            fixed={true}
            width={100}
          />
          <Column
            header={<Cell>Type</Cell>}
            cell={<TextCell data={this.state.transactions} col='Type' />}
            fixed={true}
            width={50}
          />
          <Column
            header={<Cell>Description</Cell>}
            cell={<TextCell data={this.state.transactions} col='Description' />}
            fixed={true}
            width={650}
          />
          <Column
            header={<Cell>Value</Cell>}
            cell={<TextCell data={this.state.transactions} col='Value' toFixed={2} />}
            fixed={true}
            width={100}
          />
          <Column
            header={<Cell>Balance</Cell>}
            cell={<TextCell data={this.state.transactions} col='Balance' toFixed={2} />}
            fixed={true}
            width={100}
          />
        </Table>
      </div>
    );
  }
}
