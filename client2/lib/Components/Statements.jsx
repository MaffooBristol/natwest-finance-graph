import React from 'react';

class StatementRow extends React.Component {
  render () {
    return (
      <li>{this.props.statement.filename}</li>
    );
  }
}

class StatementList extends React.Component {
  render () {
    let rows = [];
    this.props.statements.forEach((statement) => {
      rows.push(<StatementRow statement={statement} key={statement.filename} />);
    });
    return <ul>{rows}</ul>;
  }
}

export default StatementList;
