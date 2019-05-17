import React, {Component} from 'react';

export default class AboutComponent extends Component {
  componentDidMount() {
    document.title = 'SafeSpot - About';
  }

  render() {
    return(
      <div>HELLO</div>
    );
  }
}