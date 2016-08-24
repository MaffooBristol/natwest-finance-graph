'use strict';

import _        from 'lodash';
import React    from 'react';
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

class StatementRow extends React.Component {
  render () {
    return (
      <li style={style.statements.statement}>
        <div style={style.statements.statement.filename}>{this.props.statement.filename}</div>
        <div style={style.statements.statement.filesize}>{this.props.statement.size}</div>
      </li>
    );
  }
}

class StatementList extends React.Component {
  componentWillMount () {
    this.props.sockets.statements.emit('statements:request');
  }
  render () {
    let rows = [];
    this.props.statements.forEach((statement) => {
      rows.push(<StatementRow statement={statement} key={statement.filename} />);
    });
    return (
      <div style={style.statements}>
        <Dropzone onDrop={this.props.onDrop} style={style.dropzone}>
          <div>Upload</div>
        </Dropzone>
        <ul style={style.statements.list}>{rows}</ul>
      </div>
    );
  }
}

export default StatementList;
