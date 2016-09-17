'use strict';

import React from 'react';

/**
 * Search input component for the transactions table.
 *
 * @todo: Make this more generic, or reusable.
 */
export default class Search extends React.Component {
  /**
   * On input change, fire the handleSearch callback passed in via props.
   *
   * @param {Object} e
   *   The input DOM event.
   */
  handleChange (e) {
    console.log(typeof e);
    if (this.props && this.props.handleSearch !== undefined) {
      this.props.handleSearch(e.target.value);
    }
  }
  /**
   * Render the search input.
   *
   * @return {JSX}
   */
  render () {
    return (
      <input type='text' placeholder='Search' onChange={this.handleChange.bind(this)} />
    );
  }
}
