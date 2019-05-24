import React, {Component} from 'react';

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

const markericon = 'M12 0c-3.148 0-6 2.553-6 5.702 0 3.148 2.602 6.907 6 12.298 3.398-5.391 6-9.15 6-12.298 0-3.149-2.851-5.702-6-5.702zm0 8c-1.105 0-2-.895-2-2s.895-2 2-2 2 .895 2 2-.895 2-2 2zm8 12c0 2.209-3.581 4-8 4s-8-1.791-8-4c0-1.602 1.888-2.98 4.608-3.619l1.154 1.824c-.401.068-.806.135-1.178.242-3.312.949-3.453 2.109-.021 3.102 2.088.603 4.777.605 6.874-.001 3.619-1.047 3.164-2.275-.268-3.167-.296-.077-.621-.118-.936-.171l1.156-1.828c2.723.638 4.611 2.016 4.611 3.618z';

export default class MapComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      googlepolygons: [],
      zipcodepolygons: [],
      baseloc: null,
      map: <div></div>,
      currMarker: null,
      nextMarker: null,
      highMarkers: [],
      lowMarkers: []
    }

    this.selectBlock = this.selectBlock.bind(this);
    
    this.map = null;
  }

  componentWillUpdate(nextProps, nextState) {
    if (nextProps.google !== null && this.props.baseloc !== null && this.map === null) {
      this.map = new nextProps.google.maps.Map(document.getElementById('google-map'), {
        center: this.props.baseloc,
        zoom: 12,
        styles: mapStyle
      });
    //   var lMarkers = [];
    //   var hMarkers = [];
    //   for (var i = 0; i < 5; i++) {
    //     var lMarker = new nextProps.google.maps.Marker({});
    //     lMarker.setIcon({
    //       path: markericon,
    //       anchor: new nextProps.google.maps.Point(12,4),
    //       fillColor: "#0000ff",
    //       fillOpacity: 1,
    //       strokeOpacity: 0,
    //       scale: 2
    //     });
    //     lMarkers.push(lMarker);
        
    //     var hMarker = new nextProps.google.maps.Marker({});
    //     hMarker.setIcon({
    //       path: markericon,
    //       anchor: new nextProps.google.maps.Point(12,4),
    //       fillColor: "#ff0000",
    //       fillOpacity: 1,
    //       strokeOpacity: 0,
    //       scale: 2
    //     });
    //     hMarkers.push(hMarker);
    //   }
    //   var cMarker = new nextProps.google.maps.Marker({});
    //   cMarker.setIcon({
    //     path: markericon,
    //     anchor: new nextProps.google.maps.Point(12,4),
    //     fillColor: "#96f7c0",
    //     fillOpacity: 1,
    //     strokeOpacity: 0,
    //     scale: 2
    //   });
    //   var nMarker = new nextProps.google.maps.Marker({});
    //   nMarker.setIcon({
    //     path: markericon,
    //     anchor: new nextProps.google.maps.Point(12,4),
    //     fillColor: "#96f7c0",
    //     fillOpacity: 1,
    //     strokeOpacity: 0,
    //     scale: 2
    //   });
    //   this.setState({highMarkers: hMarkers, lowMarkers: lMarkers, currMarker: cMarker, nextMarker: nMarker},
    //     () => {
    //       if (nextProps.currMarker !== this.props.currMarker) {
    //         if (nextProps.currMarker !== null) {
    //           this.state.currMarker.setPosition(nextProps.currMarker);
    //           this.state.nextMarker.setMap(this.map);
    //         } else {
    //           this.state.currMarker.setMap(null);
    //         }
    //       }
      
    //       if (nextProps.nextMarker !== this.props.nextMarker) {
    //         if (nextProps.nextMarker !== null) {
    //           this.state.nextMarker.setPosition(nextProps.nextMarker);
    //           this.state.nextMarker.setMap(this.map);
    //         } else {
    //           this.state.nextMarker.setMap(null);
    //         }
    //       }
      
    //       if (nextProps.highMarkers !== this.props.highMarkers) {
    //         for (var i = 0; i < 5; i++) {
    //           if (i < nextProps.highMarkers.length-1) {
    //             this.state.highMarkers[i].setPosition(nextProps.highMarkers[i]);
    //             this.state.highMarkers[i].setMap(this.map);
    //           } else {
    //             this.state.highMarkers[i].setMap(null);
    //           }
    //         }
    //       }
      
    //       if (nextProps.lowMarkers !== this.props.lowMarkers) {
    //         for (i = 0; i < 5; i++) {
    //           if (i < nextProps.lowMarkers.length-1) {
    //             this.state.setPosition(nextProps.lowMarkers[i]);
    //             this.state.lowMarkers[i].setMap(this.map);
    //           } else {
    //             this.state.lowMarkers[i].setMap(null);
    //           }
    //         }
    //       }
    //     }  
    //   );
    }

    if ((Object.keys(nextProps.mapdata).length > 0) && (nextProps.paths) && (nextProps.pathids) && (this.props !== nextProps)) {
      if (this.state.googlepolygons.length === 0) {
        
        var hoverClickListener = function(comp, polygon, selectfunc) {
          polygon.addListener('mouseover', function() {
            if (!polygon.selected && !polygon.current) {
              polygon.setOptions({
                strokeWeight: 6,
                fillOpacity: 0.24
              });
            }
          });
          polygon.addListener('mouseout', function() {
            if (!polygon.selected && !polygon.current) {
              polygon.setOptions({
                strokeWeight: 2,
                fillOpacity: 0.3
              });
            }
          });
          polygon.addListener('click', function() {
            if (!polygon.current) {
              polygon.setOptions({
                strokeWeight: 10,
                fillOpacity: 0.2
              });
            } else {
              polygon.setOptions({
                strokeWeight: 8,
                fillOpacity: 0.22
              });
            }
            selectfunc(polygon.key);
          });
        }

        var polygons = [];
        for (var i = 0; i < nextProps.paths.length; i++) {
          if (nextProps.pathids[i] in nextProps.mapdata) {
            var poly = null;
            if (nextProps.pathids[i].toString() !== nextProps.blockid) {
              poly = new nextProps.google.maps.Polygon({
                key: nextProps.pathids[i],
                paths: nextProps.paths[i][0],
                strokeColor: "#FFFFFF",
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillOpacity: 0.3,
                fillColor: colorMap(nextProps.mapdata[nextProps.pathids[i]][nextProps.dateindex]),
                selected: false,
                current: false
              });
              hoverClickListener(this, poly, this.selectBlock);
              poly.setMap(this.map);
              polygons.push(poly);
            } else {
              poly = new nextProps.google.maps.Polygon({
                key: nextProps.pathids[i],
                paths: nextProps.paths[i][0],
                strokeColor: "#FFFFFF",
                strokeOpacity: 0.8,
                strokeWeight: 10,
                fillOpacity: 0.2,
                fillColor: colorMap(nextProps.mapdata[nextProps.pathids[i]][nextProps.dateindex]),
                selected: false,
                current: true
              });
              hoverClickListener(this, poly, this.selectBlock);
              poly.setMap(this.map);
              polygons.push(poly);
            }
          }
        }
        this.setState({googlepolygons: polygons});
      } else {
        for (i = 0; i < this.state.googlepolygons.length; i++) {
          if (this.state.googlepolygons[i].key !== nextProps.blockid && this.state.googlepolygons[i].key !== nextProps.nextblockid) {
            this.state.googlepolygons[i].setOptions({
              fillColor: colorMap(nextProps.mapdata[this.state.googlepolygons[i].key][nextProps.dateindex]),
              strokeWeight: 2,
              fillOpacity: 0.3,
              selected: false,
              current: false
            });
          } else if (this.state.googlepolygons[i].key !== nextProps.blockid) {
            this.state.googlepolygons[i].setOptions({
              fillColor: colorMap(nextProps.mapdata[this.state.googlepolygons[i].key][nextProps.dateindex]),
              strokeWeight: 8,
              fillOpacity: 0.22,
              selected: true,
              current: false
            });
          } else {
            this.state.googlepolygons[i].setOptions({
              fillColor: colorMap(nextProps.mapdata[this.state.googlepolygons[i].key][nextProps.dateindex]),
              strokeWeight: 10,
              fillOpacity: 0.2,
              selected: false,
              current: true
            });
          }
        }
      }
    }

    if ((nextProps.zipcodePaths) && (nextProps.zipcodePathids) && (this.props !== nextProps)) {
      if (this.state.zipcodepolygons.length === 0) {
        var zipcodes = [];
        for (i = 0; i < nextProps.zipcodePaths.length; i++) {
          var poly = new nextProps.google.maps.Polyline({
            path: nextProps.zipcodePaths[i][0],
            strokeColor: "#0f0f0f",
            strokeOpacity: 0.1,
            strokeWeight: 6,
            zIndex: 10000
          });
          poly.setMap(this.map);
          zipcodes.push(poly);
        }
        this.setState({zipcodepolygons: zipcodes});
      } else if (this.state.zipcodepolygons.length > 0) {
        if(nextProps.showZipcodes) {
          for (i = 0; i < this.state.zipcodepolygons.length; i++) {
            this.state.zipcodepolygons[i].setMap(this.map);
          }
        } else {
          for (i = 0; i < this.state.zipcodepolygons.length; i++) {
            this.state.zipcodepolygons[i].setMap(null);
          }
        }
      }
    }
  }

  selectBlock(key) {
    this.props.selectBlock(key);
  }

  render() {
    return(
    <div
      id='google-map'
      className={'map'}
      style={{height: this.props.height}}
    ></div>);
  }
}

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
