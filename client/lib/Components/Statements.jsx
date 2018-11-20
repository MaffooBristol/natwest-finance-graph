'use strict';

import _ from 'lodash';
import React from 'react';
import Dropzone from 'react-dropzone';

const style = {
  statements: {
    list: {
      listStyle: 'none',
      padding: 0,
      margin: 0
    },
    statement: {
      padding: '10px 20px',
      borderBottom: '1px solid #eee',
      fontSize: '0.8em',
      filename: {
        fontWeight: 500,
        padding: '2px 0'
      },
      filesize: {
        fontWeight: 300,
        fontSize: '0.9em',
        padding: '2px 0'
      }
    }
  },
  dropzone: {
    padding: '20px',
    margin: 10,
    border: '1px solid #9bd',
    fontSize: '13px',
    textAlign: 'center',
    color: '#69c',
    cursor: 'pointer'
  }
};

/**
 * StatementRow class, which returns a row for a statement detail list item.
 */
class StatementRow extends React.Component {
  /**
   * It's a fucking render function, don't you get what this does yet? ;)
   *
   * @return {ReactElement}
   */
  render () {
    return (
      <li style={style.statements.statement}>
        {_.map(['filename', 'filesize'], (row) => {
          return <div style={style.statements.statement[row]} key={row}>{this.props.statement[row]}</div>;
        })}
      </li>
    );
  }
}

/**
 * StatementList class, shows a list of statements.
 */
class StatementList extends React.Component {
  /**
   * Before the component mounts, fire off a statement request.
   *
   * Perhaps this should be in the componentDidMount function?
   */
  componentWillMount () {
    this.props.sockets.statements.emit('statements:request');
  }
  /**
   * Event to handle when a statement is uploaded.
   *
   * @param {FileList|Array} files
   *   An array of files or FileList native type to upload via SIOFU.
   */
  onDrop = (files) => {
    this.props.statementUploader.submitFiles(files);
    this.props.statementUploader.addEventListener('error', (err) => {
      alert(`Error: ${err.message}`);
    });
  }
  /**
   * Render out a list of statements.
   *
   * @return {ReactElement}
   */
  render () {
    const rows = [];
    this.props.statements.forEach((statement) => {
      rows.push(<StatementRow statement={statement} key={statement.filename} />);
    });
    return (
      <div style={style.statements}>
        <Dropzone onDrop={this.onDrop} style={style.dropzone}>
          <div>Upload</div>
        </Dropzone>
        <ul style={style.statements.list}>{rows}</ul>
      </div>
    );
  }
}

export default StatementList;
