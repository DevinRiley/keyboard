import React, { Component } from 'react';

class Key extends Component {
  render() {
    const pressed = this.props.pressed ? 'key-pressed' : '';

    return (
      <div className={ `${this.props.color}-key ${pressed}`} />
    );
  }
}

export default Key;
