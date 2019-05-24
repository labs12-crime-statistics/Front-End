import React, {Component} from 'react';
import { Link } from 'react-router-dom';
import Questionnaire from './QuestionnaireComponent.js';
import BackgroundImage from '../images/homepageBackground.png';

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
      <div className="col-10 offset-1">
        <div className="row align-items-center text-center" style={{
          height: "80vh",
          backgroundImage: 'url('+BackgroundImage+')',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover'
        }}>
          <div className="col-12">
            <Link className="btn btn-primary" to="/map"><h3 style={{margin: "0"}}>Explore the Map</h3></Link>
          </div>
        </div>
        <Questionnaire />
      </div>
    );
  }
}