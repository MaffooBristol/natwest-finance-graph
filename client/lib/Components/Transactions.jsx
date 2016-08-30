'use strict';

// This is shit atm because all the table modules aren't very good.

import React from 'react';
import _ from 'lodash';
import {Table, Column, Cell} from 'fixed-data-table';
import 'react-addons-shallow-compare';
import {FlexTable, FlexColumn} from 'react-virtualized';

import styles from 'react-virtualized/styles.css';

const TextCell = ({rowIndex, data, col, ...props}) => {
  let cellData = data[rowIndex][col];
  if (props.toFixed !== undefined && props.toFixed) {
    cellData = cellData.toFixed(props.toFixed);
  }
  return (
    <Cell {...props}>
      {cellData}
    </Cell>
  );
};

export default class TransactionList extends React.Component {

  rowGetter = ({index}) => {
    return this.props.transactions[index];
  }

  _rowClassName ({index}) {
    if (index < 0) {
      return styles.headerRow;
    }
    else {
      return index % 2 === 0 ? styles.evenRow : styles.oddRow;
    }
  }

  render () {
    if (!this.props.transactions.length) return null;
    // Date, Type, Description, Value, Balance, Account Name, Account Number
    let style = {
      fontSize: '0.8em'
    };
/*    return (
      <div>
        <Table
          rowHeight={25}
          rowsCount={this.props.transactions.length}
          headerHeight={35}
          width={1000}
          height={500}
          style={style}
          {...this.props}>
          <Column
            header={<Cell>Date</Cell>}
            cell={<TextCell data={this.props.transactions} col='Date' />}
            fixed={true}
            width={100}
          />
          <Column
            header={<Cell>Type</Cell>}
            cell={<TextCell data={this.props.transactions} col='Type' />}
            fixed={true}
            width={50}
          />
          <Column
            header={<Cell>Description</Cell>}
            cell={<TextCell data={this.props.transactions} col='Description' />}
            fixed={true}
            width={650}
          />
          <Column
            header={<Cell>Value</Cell>}
            cell={<TextCell data={this.props.transactions} col='Value' toFixed={2} />}
            fixed={true}
            width={100}
          />
          <Column
            header={<Cell>Balance</Cell>}
            cell={<TextCell data={this.props.transactions} col='Balance' toFixed={2} />}
            fixed={true}
            width={100}
          />
        </Table>
      </div>
    ); */
    return (
      <FlexTable
        ref='Table'
        height={400}
        width={600}
        className={styles.FlexTable}
        headerClassName={styles.FlexTable__headerColumn}
        rowClassName={::this._rowClassName}
        rowHeight={20}
        rowCount={200}
        rowGetter={this.rowGetter}>
        <FlexColumn
          label='Date'
          cellDataGetter={({ columnData, dataKey, rowData }) => rowData.Date}
          dataKey='Date'
          width={60}
        />
        <FlexColumn
          label='Type'
          cellDataGetter={({ columnData, dataKey, rowData }) => rowData.Type}
          dataKey='Type'
          width={40}
        />
        <FlexColumn
          label='Description'
          cellDataGetter={({ columnData, dataKey, rowData }) => rowData.Description}
          dataKey='Description'
          width={500}
        />
        <FlexColumn
          label='Value'
          cellDataGetter={({ columnData, dataKey, rowData }) => rowData.Value}
          dataKey='Value'
          width={60}
        />
        <FlexColumn
          label='Balance'
          cellDataGetter={({ columnData, dataKey, rowData }) => rowData.Balance}
          dataKey='Balance'
          width={60}
        />
      </FlexTable>
    );
  }
}
