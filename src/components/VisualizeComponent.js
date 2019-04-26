import React, {Component} from 'react';
import MapComponent from './MapComponent.js';
import {Line} from './LineGraphComponent.js';
import {Sunburst} from './SunburstComponent.js';
import axios from 'axios';

// const be_url = "http://localhost:5000";
const be_url = "https://crimespot-backend.herokuapp.com";

export default class VisualizeComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cityId: 1,
      blockid: "127",
      dataMap: null,
      dataDate: null,
      dataTime: null,
      dataBlockId: null,
      dataDOTW: null,
      dataCrimeTypes: null,
      address: null,
      paths: null,
      pathids: null,
      baseLoc: {lat: 41.8781, lng: -87.6298}
    }
  }

  componentDidMount() {
    new Promise((resolve) => axios.get(be_url+"/city/"+this.state.cityId+"/data"+(this.state.blockid ? "?blockid="+this.state.blockid : ""))
      .then(function(response) {
        const values = {};
        response.data.other.forEach(e => {
          values[e.id] = e.values;
        });
        const keys = Object.keys(response.data.main);
        var blockid = "";
        for (var i = 0; i < keys.length; i++) {
          if (keys[i] !== "all") {
            blockid = keys[i];
            break;
          }
        }
        var data = {values: values, blockid: blockid};
        data.date = [{id: "all", data: response.data.main.all.values_date}]
        data.time = [{id: "all", data: response.data.main.all.values_time}]
        data.dow = [{id: "all", data: response.data.main.all.values_dow}]
        data.crime_all = response.data.main.all.values_type
        if (blockid !== "") {
          data.date.push({id: blockid, data: response.data.main[blockid].values_date})
          data.time.push({id: blockid, data: response.data.main[blockid].values_time})
          data.dow.push({id: blockid, data: response.data.main[blockid].values_dow})
          data.crime_block = response.data.main[blockid].values_type
        }
        resolve(data);
      })).then((result) => {
        this.setState({
          dataMap: result.values, 
          dataDate: result.date,
          dataTime: result.time,
          dataBlockId: result.blockid,
          dataDOTW: result.dow,
          dataCrimeTypesAll: result.crime_all,
          dataCrimeTypesBlock: result.crime_block
        });
      });
    
    new Promise((resolve) => axios.get(be_url+"/city/"+this.state.cityId+"/shapes")
      .then(function (response) {
        var shapes = [];
        var shapeids = [];
        var coords = {lat: response.data.citylocation[0], lng: response.data.citylocation[1]};
        response.data.blocks.forEach((s) => {
          var paths = [];
          s.shape[0].forEach(si => {
            var paths2 = [];
            si.forEach(sj => {paths2.push({lat: sj[1], lng: sj[0]})});
            paths.push(paths2);
          });
          shapes.push(paths);
          shapeids.push(s.id);
        });
        resolve({shapes, shapeids, coords});
      })).then((result) => {
        this.setState({paths: result.shapes, pathids: result.shapeids, baseLoc: result.coords})
      });
  }
  
  render() {
    return(
      <div>
        <div style={{height: "100vh"}}><MapComponent blockid={this.state.blockid} baseloc={this.state.baseLoc} mapdata={this.state.dataMap} paths={this.state.paths} pathids={this.state.pathids} /></div>
        <div style={{width: "80vw", height: "60vh"}}><Sunburst data={(this.state.dataCrimeTypesAll ? this.state.dataCrimeTypesAll : {})} /></div>
        <div style={{width: "80vw", height: "60vh"}}><Sunburst data={(this.state.dataCrimeTypesBlock ? this.state.dataCrimeTypesBlock : {})} /></div>
        <div style={{width: "80vw", height: "60vh"}}><Line axisbottom={{"format": "%m/%Y", "orient": "bottom", "tickSize": 5, "tickPadding": 5, "tickRotation": 0, "legend": "Month / Year", "legendOffset": 36, "legendPosition": "middle"}} xscale={{"type": "time", "format": "%m/%Y", "min": "auto", "max": "auto"}} yvalue={"Crime Severity"} data={(this.state.dataDate ? this.state.dataDate : [])} /></div>
        <div style={{width: "80vw", height: "60vh"}}><Line axisbottom={{"format": "%I %p", "orient": "bottom", "tickSize": 5, "tickPadding": 5, "tickRotation": 0, "legend": "Hour of Day", "legendOffset": 36, "legendPosition": "middle"}} xscale={{"type": "time", "format": "%H", "min": "auto", "max": "auto"}} yvalue={"Crime Severity"} data={(this.state.dataTime ? this.state.dataTime : [])} /></div>
        <div style={{width: "80vw", height: "60vh"}}><Line axisbottom={{"orient": "bottom", "tickSize": 5, "tickPadding": 5, "tickRotation": 0, "legend": "Day of Week", "legendOffset": 36, "legendPosition": "middle"}} xscale={{"type": "point"}} yvalue={"Crime Severity"} data={(this.state.dataDOTW ? this.state.dataDOTW : [])} /></div>
      </div>
    );
  }
}