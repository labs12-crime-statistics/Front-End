import React, { Component } from 'react';
import Script from 'react-load-script';
import uuidv4 from 'uuid/v4';

class Search extends Component {
  constructor(props) {
    super(props);
    this.state = {
      apiKey: 'AIzaSyAiSsYgrWa71hZoeEEKaZZ2SB4nDOJxLsI',
      googleMapsClient: null,
      uuid: uuidv4(),
      showCities: false,
      showPlaces: false,
      places: []
    };

    this.handleSearch = this.handleSearch.bind(this);
    this.handlePlace = this.handlePlace.bind(this);
    this.displayPredictions = this.displayPredictions.bind(this);
    this.handleCitiesClick = this.handleCitiesClick.bind(this);
    this.handlePlaceDetails = this.handlePlaceDetails.bind(this);
    
    this.citiesDropdown = React.createRef();
    this.searchBarField = React.createRef();
  }

  componentWillMount() {
    document.addEventListener('mousedown', this.handleCitiesClick, false);
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleCitiesClick, false);
  }

  handleCitiesClick(e) {
    if (this.citiesDropdown.current.contains(e.target)) {
      return;
    }
    this.setState({showCities: false});
  }

  displayPredictions(predictions, status) {
    if (predictions) {
      console.log(predictions);
      var places = [];
      var citylength = this.props.city.split(",").length;
      for (var i = 0; i < predictions.length; i++) {
        var indParts = predictions[i].description.split(",");
        var output = indParts.slice(0, indParts.length-citylength).join(",");
        if (output !== "") {
          places.push(<a className="dropdown-item" id={predictions[i].place_id} key={predictions[i].place_id} onClick={this.handlePlace}>{output}</a>)
        }
      }
      this.setState({places, showPlaces: places.length > 0});
    } else {
      this.setState({places: [], showPlaces: false});
    }
  }

  handlePlaceDetails(place, status) {
    this.props.selectPlace(place[0].geometry.location.toJSON());
  }

  handleSearch(e) {
    if (e.target.value !== "") {
      var options = {
        types: ['address'],
        input: e.target.value+", "+this.props.city,
        sessiontoken: this.state.uuid
      };

      /*global google*/
      var service = new google.maps.places.AutocompleteService();
      service.getQueryPredictions(options, this.displayPredictions);
    } else {
      this.setState({places: []});
    }
  }

  handlePlace(e) {
    const request = {'placeId': e.target.id};
    console.log(request);
    /*global google*/
    const geocoder = new google.maps.Geocoder();
    console.log(geocoder);
    geocoder.geocode(request, this.handlePlaceDetails);
    this.setState({places: [], showPlaces: false});
    this.searchBarField.current.value = "";
  }

  render() {
    return (
      <div className="row">
        <Script
          url={"https://maps.googleapis.com/maps/api/js?key="+this.state.apiKey}
        />
        <div className="col-12">
          <div className="row-nomarg">
            <div className="input-group mb-3 places-searchbar">
              <input ref={this.searchBarField} onChange={this.handleSearch} type="text" className="form-control" id="autocomplete" placeholder="Search for address" />
              <div className="input-group-append col-5 places-searchbar" style={{padding: "0px"}}>
                <button className="btn btn-outline-secondary places-searchbar dropdown-toggle" type="button" onClick={() => this.setState({showCities: true})}>{this.props.city}</button>
              </div>
            </div>
          </div>
          <div className="row-nomarg">
            <div className="col-7 places-searchbar">
              {this.state.showPlaces ? <div className={"dropdown-menu places-searchbar show"}>
                {this.state.places}
              </div> : null}
            </div>
            <div ref={this.citiesDropdown} className="col-5 places-searchbar">
              <div className={"dropdown-menu places-searchbar"+(this.state.showCities ? " show" : "")}>
                {this.props.cities}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Search;
