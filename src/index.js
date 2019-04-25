import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router, Route} from 'react-router-dom';
import './index.css';
import * as serviceWorker from './serviceWorker';
import HomeComponent from './components/HomeComponent';
import MapComponent from './components/MapComponent';
import AboutComponent from './components/AboutComponent';

ReactDOM.render(
    <Router>
        <Route exact path="/" render={() => <HomeComponent />} />
        <Route exact path="/map" render={() => <MapComponent cityid={1} />} />
        <Route exact path="/about" render={() => <AboutComponent />} />
    </Router>,
document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
