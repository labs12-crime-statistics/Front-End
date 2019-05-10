// Google map component with overlay

import React, {Component} from 'react';
import {Map, Polygon, GoogleApiWrapper} from 'google-maps-react';

class MapComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      googlepolygons: null,
      zipcodepolygons: null,
      baseloc: null,
      map: <div></div>
    }

    this.selectBlock = this.selectBlock.bind(this);
  }

  selectBlock(e) {
    this.props.selectBlock(e.id.split("-")[1]);
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
    
    if ((nextProps.mapdata) && (nextProps.paths) && (nextProps.pathids) && (this.props !== nextProps)) {
      var polygons = [];
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
            onMouseover={(p,o,e) => {o.setOptions({fillOpacity: 0.18, strokeWeight: 6})}}
            onMouseout={(p,o,e) => o.setOptions({fillOpacity: 0.3, strokeWeight: 2})}
            onClick={this.selectBlock}
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
          />);
        }
      }
      var zipcodePolygons = [];
      for (i = 0; i < nextProps.zipcodePaths.length; i++) {
        zipcodePolygons.push(<Polygon
          id={"zipcode-"+nextProps.zipcodePathids[i].toString()}
          key={nextProps.zipcodePathids[i]}
          paths={nextProps.zipcodePaths[i]}
          strokeColor="#FFFFFF"
          strokeOpacity={0.8}
          strokeWeight={10}
          fillOpacity={0.0}
        />);
      }
      this.setState({googlepolygons: polygons, zipcodepolygons: zipcodePolygons});
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
      style={{height: this.props.height}}
    >
      {/* {this.state.zipcodepolygons} */ null}
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
      "featureType": "administrative",
      "elementType": "all",
      "stylers": [
          {
              "visibility": "simplified"
          }
      ]
  },
  {
      "featureType": "landscape",
      "elementType": "geometry",
      "stylers": [
          {
              "visibility": "simplified"
          },
          {
              "color": "#fcfcfc"
          }
      ]
  },
  {
      "featureType": "poi",
      "elementType": "geometry",
      "stylers": [
          {
              "visibility": "simplified"
          },
          {
              "color": "#fcfcfc"
          }
      ]
  },
  {
      "featureType": "road.highway",
      "elementType": "geometry",
      "stylers": [
          {
              "visibility": "simplified"
          },
          {
              "color": "#dddddd"
          }
      ]
  },
  {
      "featureType": "road.arterial",
      "elementType": "geometry",
      "stylers": [
          {
              "visibility": "simplified"
          },
          {
              "color": "#dddddd"
          }
      ]
  },
  {
      "featureType": "road.local",
      "elementType": "geometry",
      "stylers": [
          {
              "visibility": "simplified"
          },
          {
              "color": "#eeeeee"
          }
      ]
  },
  {
      "featureType": "water",
      "elementType": "geometry",
      "stylers": [
          {
              "visibility": "simplified"
          },
          {
              "color": "#dddddd"
          }
      ]
  }
]
