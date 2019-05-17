import React, {Component} from 'react';
import { Link } from "react-router-dom";
import { ReactComponent as TextLogo } from '../images/textlogo.svg';

export default class Navbar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      navbarExpanded: true
    }
  }

  render() {
    return(
      <nav className="navbar navbar-expand-lg navbar-light bg-light justify-content-between">
        <Link className="navbar-brand" to="/"><TextLogo style={{height: "100px", width: "279px"}} /></Link>
        <button className="navbar-toggler" type="button" onClick={() => this.setState((prevState) => ({navbarExpanded: !prevState.navbarExpanded}))}>
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className={"navbar-collapse"+(this.state.navbarExpanded ? "" : " collapse")} id="navbarSupportedContent">
          <ul className="navbar-nav ml-auto">
            <li className={"nav-item"+(window.location.pathname === "/map" ? " active" : "")}>
              <Link className="nav-link" to="/map">Map</Link>
            </li>
            <li className={"nav-item"+(window.location.pathname === "/about" ? " active" : "")}>
              <Link className="nav-link" to="/about">About</Link>
            </li>
          </ul>
        </div>
      </nav>
    );
  }
}