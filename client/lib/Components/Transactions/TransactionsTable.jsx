'use strict';

import React from 'react';
import _ from 'lodash';
import styled, { css } from 'styled-components';

const StyledLoading = styled.div`
  text-align: center;
  padding-top: 20%;
  color: #999;
`;

const StyledTable = styled.table`
  font-size: 0.8em;
  width: 100%;
  border-collapse: collapse;
`;

const StyledTableHeaderCell = styled.th`
  padding: 5px 8px;
  background: #ddd;
  border: 1px solid #aaa;
`;

const StyledTableRow = styled.tr`
  background: #fee;
  ${props => props.valence === 'up' && css`background: #efe`};
  ${props => props.valence === 'down' && css`background: #fee`};
`;

const StyledTableCell = styled.td`
  padding: 5px 8px;
  border: 1px solid #ddd;
`;

/**
 * Transactions data table cell.
 */
class TableCell extends React.Component {
  /**
   * Returns a single cell with the "value" taken in from the props.
   *
   * @return {ReactElement}
   */
  render () {
    return <StyledTableCell>{this.props.value}</StyledTableCell>;
  }
}

/**
 * Transactions data table row.
 */
class TableRow extends React.Component {
  /**
   * Format currency based on the global value or the default.
   *
   * @param {Number (float)} val
   *   The numeric value that will be formatted as currency.
   *
   * @return {String}
   *   String output of the currency, to two decimal places and with symbol.
   */
  static formatCurrency (val, currency = '£') {
    return `${currency !== false ? currency : ''}${parseFloat(val).toFixed(2)}`;
  }
  /**
   * Returns a single table row with the "cells" taken in from the props.
   *
   * @return {ReactElement}
   */
  render () {
    return (
      <StyledTableRow valence={parseFloat(this.props.cells.Value) > 0 ? 'up' : 'down'}>
        <TableCell value={this.props.cells.Date} />
        <TableCell value={this.props.cells.Type} />
        <TableCell value={TableRow.formatCurrency(this.props.cells.Value)} />
        <TableCell value={TableRow.formatCurrency(this.props.cells.Balance)} />
        <TableCell value={this.props.cells.Description} />
      </StyledTableRow>
    );
  }
}

/**
 * Transactions data table; this is the default export of this class.
 */
export default class Table extends React.Component {
  /**
   * Returns the data table.
   *
   * @return {ReactElement}
   */
  render () {
    if (!this.props.initRows.length) {
      return <StyledLoading>Loading transactions table...</StyledLoading>;
    }
    return (
      <StyledTable>
        <thead>
          <tr>
            {_.map(['Date', 'Type', 'Value', 'Balance', 'Description'], (key) => {
              return <StyledTableHeaderCell key={key}>{key}</StyledTableHeaderCell>;
            })}
          </tr>
        </thead>
        <tbody>
          {_.map(this.props.rows, (row, index) => <TableRow cells={row} key={index} />)}
        </tbody>
      </StyledTable>
    );
  }
}
