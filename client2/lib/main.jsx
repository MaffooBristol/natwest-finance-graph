import React from 'react';
import ReactDOM from 'react-dom';

class Hello extends React.Component {

  render() {
    return <div>Ey up, {this.props.name}!</div>
  }
}

ReactDOM.render(<Hello name='poppet'/>, document.getElementById('app'));
