import React, {Component} from 'react';
import { ReactComponent as AnimatedLogo } from '../images/animatelogo.svg';

export default class LoadingLogo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fade: false
    }
  }

  componentDidMount() {
    this.lockSpinner = document.getElementById("lock-spinner");
    this.lockSpinner.classList.add("logo-lock-spinner");
  }

  componentWillReceiveProps(nextProps, nextState) {
    if (nextProps.finish) {
      this.lockBody = document.getElementById("lock-body");
      this.lockShaft = document.getElementById("lock-shaft");
      this.lockLoop = document.getElementById("lock-loop");

      this.lockBody.classList.add("logo-lock-close-bottom");
      this.lockLoop.classList.add("logo-lock-close-top");
      this.lockShaft.classList.add("logo-lock-close-shaft");
      setTimeout(() => {setTimeout(() => {this.props.endLoading()}, 1500); this.setState({fade: true})}, 1500);
    }
  }
  
  render() {
    return(
      <AnimatedLogo className={this.state.fade ? "logo-lock-fade" : ""} style={this.props.style} />
    );
  }
}