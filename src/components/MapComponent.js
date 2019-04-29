// Google map component with overlay

import React, {Component} from 'react';
import {Map, Polygon, GoogleApiWrapper} from 'google-maps-react';

class MapComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      googlepolygons: null,
      baseloc: null,
      map: <div></div>
    }
  }

  componentWillUpdate(nextProps, nextState) {
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

    if ((nextProps.mapdata) && (nextProps.paths) && (nextProps.pathids) && (!nextState.googlepolygons)) {
      var polygons = [];
      console.log(nextProps);
      for (var i = 0; i < nextProps.paths.length; i++) {
        if (nextProps.pathids[i].toString() !== nextProps.blockid) {
          polygons.push(<Polygon
            id={"block-"+nextProps.pathids[i].toString()}
            key={nextProps.pathids[i]}
            paths={nextProps.paths[i]}
            strokeColor="#FFFFFF"
            strokeOpacity={0.8}
            strokeWeight={2}
            fillColor={colorMap((nextProps.mapdata[nextProps.pathids[i]] || [0.0,0.0])[1])}
            fillOpacity={0.3}
            onMouseover={(p,o,e) => {console.log(p.id); o.setOptions({fillOpacity: 0.18, strokeWeight: 6})}}
            onMouseout={(p,o,e) => o.setOptions({fillOpacity: 0.3, strokeWeight: 2})}
          />);
        } else {
          polygons.push(<Polygon
            id={"block-"+nextProps.pathids[i].toString()}
            key={nextProps.pathids[i]}
            paths={nextProps.paths[i]}
            strokeColor="#FFFFFF"
            strokeOpacity={0.8}
            strokeWeight={8}
            fillColor={colorMap((nextProps.mapdata[nextProps.pathids[i]] || [0.0,0.0])[1])}
            fillOpacity={0.24}
            onMouseover={(p,o,e) => {console.log(p.id)}}
          />);
        }
      }
      this.setState({googlepolygons: polygons});
    }

    if (this.state.baseloc !== nextProps.baseloc) {
      this.setState({baseloc: nextProps.baseloc}, () => this.refs.map.recenterMap());
    }
  }

  render() {
    return(
    <Map
      ref='map'
      google={this.props.google}
      styles={mapStyle}
      className={'map'}
      center={this.state.baseloc}
      zoom={12}
    >
      {this.state.googlepolygons}
    </Map>);
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
