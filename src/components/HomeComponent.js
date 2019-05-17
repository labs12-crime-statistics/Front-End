import React, {Component} from 'react';
import { Link } from 'react-router-dom';

export default class HomeComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      startLoading: false,
      finishLoading: false
    }
  }

  componentDidMount() {
    document.title = 'SafeSpot';
  }

  render() {
    return(
      <div clssName="col-10">
        <div className="row align-items-center text-center">
          <div className="col-12">
            <Link className="btn btn-primary" to="/map">Get Started</Link>
          </div>
        </div>
      </div>
    );
  }
}