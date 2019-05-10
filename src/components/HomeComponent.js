import React, {Component} from 'react';
import LoadingLogo from './LoadingLogo';

export default class HomeComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      startLoading: false,
      finishLoading: false
    }
  }
  render() {
    return(
      <div>
        <LoadingLogo style={{width: "300px", height: "300px"}} finish={this.state.finishLoading} endLoading={() => this.setState({startLoading: false, finishLoading: false})} />
        <a onClick={() => this.setState({finishLoading: true})}>Finish Loading</a>
      </div>
    );
  }
}