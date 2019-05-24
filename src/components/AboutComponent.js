import React, {Component} from 'react';
import GithubIcon from '../images/github.svg';
import LinkedinIcon from '../images/linkedin.svg';
import MichaelImg from '../images/michael.png';
import SamirImg from '../images/samir.png';
import AlbertImg from '../images/albert.png';

export default class AboutComponent extends Component {
  componentDidMount() {
    document.title = 'SafeSpot - About';
  }

  render() {
    return(
      <div>
        <div className="row-nomarg">
          <div className="jumbotron jumbotron-fluid" style={{width: "100%"}}>
            <div className="container-fluid">
              <div className="col-8 offset-2">
                <h1 className="display-4">About SafeSpot</h1>
                <p className="lead">
                  SafeSpot provides urban historical and predictive crime data visualizations.
                  SafeSpot collects historical and current crime incidents directly from public local city data portals.
                  We process and transform the data into an interactive map along with other data visualization features to help inform users.
                  Local city residents or short-term visitors and tourists can navigate the application to view crime trends and predictions by location, time of day and incident types.
                  SafeSpot’s goal is to leverage the latest data science and machine learning techniques to help users assess the safety of their community or plan a night out in a new neighborhood within a city.
                  We are excited to add additional city locations to SafeSpot and find other layers of public data that can better inform users on public safety.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="row-nomarg">
          <div className="jumbotron jumbotron-fluid" style={{width: "100%"}}>
            <div className="container-fluid">
              <div className="col-8 offset-2">
                <h1 className="display-4">About Our Team</h1>
                <div className="col-12">
                  <div className="row">
                    <div className="col-3">
                      <img className="rounded-circle" style={{width: "100%", backgroundColor: "#6f6f6f"}} src={AlbertImg} />
                    </div>
                    <div className="col-8 offset-1">
                      <h2>Albert Wong</h2>
                      <h4>Data Scientist</h4>
                      <div>
                        <a href="https://github.com/albert-h-wong" style={{margin: "10px"}}><img src={GithubIcon} /></a>
                        <a href="https://www.linkedin.com/in/albert-wong-53b49a23/" style={{margin: "10px"}}><img src={LinkedinIcon} /></a>
                      </div>
                      <p>Albert was focused on the domain research, data analysis and predictive modeling evaluation. He built traditional time series, tree-based, neural network, and k-neighbors models and assessed the precision and inference of the crime rates for user application features.</p>
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-8" style={{textAlign: "right"}}>
                      <h2>Samir Gadkari</h2>
                      <h4>Data Scientist</h4>
                      <div>
                        <a href="https://github.com/samirgadkari" style={{margin: "10px"}}><img src={GithubIcon} /></a>
                        <a href="http://www.linkedin.com/in/1samir" style={{margin: "10px"}}><img src={LinkedinIcon} /></a>
                      </div>
                      <p>Samir was focused on Data Analysis and Predictions. He worked on the Multi-Output Random Forest Regressor model with grid search, the LSTM model, the XGB model, and the ARIMA model. He wrote the code for these models, ran them on AWS SageMaker and evaluated model efficacy and predictions. These models predicted the crime risk, crime counts, and crime types users would face in the city block they were interested in.</p>
                    </div>
                    <div className="col-3 offset-1">
                      <img className="rounded-circle" style={{width: "100%", backgroundColor: "#6f6f6f"}} src={SamirImg} />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-3">
                      <img className="rounded-circle" style={{width: "100%", backgroundColor: "#6f6f6f"}} src={MichaelImg} />
                    </div>
                    <div className="col-8 offset-1">
                      <h2>Michael Beck</h2>
                      <h4>Data Scientist</h4>
                      <div>
                        <a href="https://github.com/brit228" style={{margin: "10px"}}><img src={GithubIcon} /></a>
                        <a href="http://www.linkedin.com/in/michaelpbeck" style={{margin: "10px"}}><img src={LinkedinIcon} /></a>
                      </div>
                      <p>Michael was focused on the development of the Backend, Frontend, and Database systems, and the visualization of data for the user. Google Maps API, Redis Queue with Redis, PostgreSQL, React, Nivo.Rocks, and Flask are just a few of the tools he used to get SafeSpot working.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}