// Google map component with overlay

import React, {Component} from 'react';
import {Map, Polygon, GoogleApiWrapper} from 'google-maps-react';
import axios from 'axios';

class MapComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      googlepolygons: null,
      shapeids: null,
      baseLoc: {lat: 41.8781, lng: -87.6298}
    }
  }

  componentDidMount(){
    new Promise((resolve) => axios.get("https://crimespot-backend.herokuapp.com/city/1/shapes")
      .then(function (response) {
        const colorMap = (alpha) => {
          var r = 0;
          var g = 0;
          if (alpha < 0.5) {
            r = Math.round(255 * 2.0 *alpha);
            g = 255;
          } else {
            r = 255;
            g = Math.round(255 * 2.0 * (1.0 - alpha));
          }
          r = r.toString(16).toUpperCase();
          if (r.length < 2) {r = "0" + r}
          g = g.toString(16).toUpperCase();
          if (g.length < 2) {g = "0" + g}
          return("#"+r+g+"00");
        }
        var shapes = [];
        var shapeids = {};
        var coords = {lat: response.data.citylocation[0], lng: response.data.citylocation[1]};
        response.data.blocks.forEach((s, ind) => {
          shapeids[s.id] = ind;
          var paths = [];
          s.shape[0].forEach(si => {
            var paths2 = [];
            si.forEach(sj => {paths2.push({lat: sj[1], lng: sj[0]})});
            paths.push(paths2);
          });
          var color = colorMap(Math.random());
          shapes.push(<Polygon
            key={s.id}
            paths={paths}
            strokeColor="#FFFFFF"
            strokeOpacity={0.8}
            strokeWeight={2}
            fillColor={color}
            fillOpacity={0.3}
            onMouseover={(p,o,e) => o.setOptions({fillOpacity: 0.18, strokeWeight: 6})}
            onMouseout={(p,o,e) => o.setOptions({fillOpacity: 0.3, strokeWeight: 2})}
          />);
        });
        resolve({shapes, shapeids, coords});
      })).then((result) => {
        this.setState({googlepolygons: result.shapes, baseLoc: result.coords})
      });
  }

  render() {
    return(
      <Map
        google={this.props.google}
        styles={mapStyle}
        className={'map'}
        center={this.state.baseLoc}
        zoom={14}
      >
        {this.state.googlepolygons}
      </Map>
    );
  }
}

// Google API key
export default GoogleApiWrapper({
  apiKey: "AIzaSyAiSsYgrWa71hZoeEEKaZZ2SB4nDOJxLsI"
})(MapComponent);

// Google map style
const mapStyle = [
  {
      "stylers": [
          {
              "hue": "#2c3e50"
          },
          {
              "saturation": 250
          }
      ]
  },
  {
      "featureType": "road",
      "elementType": "geometry",
      "stylers": [
          {
              "lightness": 50
          },
          {
              "visibility": "simplified"
          }
      ]
  },
  {
      "featureType": "road",
      "elementType": "labels",
      "stylers": [
          {
              "visibility": "off"
          }
      ]
  }
]
