import React, {Component} from 'react';
import MapComponent from './MapComponent.js';
import {Line} from './LineGraphComponent.js';
import {Sunburst} from './SunburstComponent.js';
import axios from 'axios';

// const be_url = "http://localhost:5000";
const be_url = "http://localhost:5000";

export default class VisualizeComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      cityId: 1,
      blockid: null,
      startdate: "",
      enddate: "",
      starttime: "",
      endtime: "",
      dotw: [],
      crimetypes: [],
      locdescs: [],
      dataMap: null,
      dataDate: null,
      dataTime: null,
      dataBlockId: null,
      dataDOTW: null,
      dataCrimeTypesAll: null,
      dataCrimeTypesBlock: null,
      dataLocDescAll: null,
      dataLocDescBlock: null,
      address: null,
      paths: null,
      pathids: null,
      zipcodePaths: null,
      zipcodePathids: null,
      baseLoc: {lat: 41.8781, lng: -87.6298}
    }
    this.downloadCityData = this.downloadCityData.bind(this);
    this.getCityShapes = this.getCityShapes.bind(this);
    this.getCityData = this.getCityData.bind(this);
  }

  componentDidMount() {
    this.getCityShapes();
    this.getCityData();
  }

  downloadCityData() {
    var params = {};
    if (this.state.startdate !== "") {
      params["sdt"] = this.state.startdate;
    }
    if (this.state.enddate !== "") {
      params["edt"] = this.state.enddate;
    }
    if (this.state.starttime !== "") {
      params["stime"] = this.state.starttime;
    }
    if (this.state.endtime !== "") {
      params["etime"] = this.state.endtime;
    }
    if (this.state.dotw !== []) {
      params["dotw"] = this.state.dotw.map(String).join(",");
    }
    if (this.state.crimetypes !== []) {
      params["crimetypes"] = this.state.crimetypes.join(",");
    }
    if (this.state.locdescs !== []) {
      var locdescs1 = [];
      var locdescs2 = [];
      var locdescs3 = [];
      for (var i = 0; i < this.state.locdescs.length; i++) {
        locdescs1.push(this.state.locdescs[i][0]);
        locdescs2.push(this.state.locdescs[i][1]);
        locdescs3.push(this.state.locdescs[i][2]);
      }
      params["locdesc1"] = locdescs1.join(",");
      params["locdesc2"] = locdescs2.join(",");
      params["locdesc3"] = locdescs3.join(",");
    }
    new Promise((resolve) => axios({
      url: be_url+"/city/"+this.state.cityId+"/download",
      params: params,
      method: 'GET',
      responseType: 'blob'
    }).then(function(response) {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'download.csv');
        document.body.appendChild(link);
        link.click();
      }));
  }

  getCityShapes() {
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
        var zipcodeShapes = [];
        var zipcodes = [];
        response.data.zipcodes.forEach((s) => {
          var paths = [];
          s.shape[0].forEach(si => {
            var paths2 = [];
            si.forEach(sj => {paths2.push({lat: sj[1], lng: sj[0]})});
            paths.push(paths2);
          });
          zipcodeShapes.push(paths);
          zipcodes.push(s.zipcode);
        });
        resolve({shapes, zipcodeShapes, shapeids, zipcodes, coords});
      })).then((result) => {
        this.setState({
          paths: result.shapes,
          pathids: result.shapeids,
          zipcodePaths: result.zipcodeShapes,
          zipcodePathids: result.zipcodes,
          baseLoc: result.coords
        });
      });
  }

  getCityData() {
    var params = {};
    if (this.state.blockid !== null) {
      params["blockid"] = this.state.blockid;
    }
    if (this.state.startdate !== "") {
      params["sdt"] = this.state.startdate;
    }
    if (this.state.enddate !== "") {
      params["edt"] = this.state.enddate;
    }
    if (this.state.starttime !== "") {
      params["stime"] = this.state.starttime;
    }
    if (this.state.endtime !== "") {
      params["etime"] = this.state.endtime;
    }
    if (this.state.dotw.length > 0) {
      params["dotw"] = this.state.dotw.map(String).join(",");
    }
    if (this.state.crimetypes.length > 0) {
      params["crimetypes"] = this.state.crimetypes.join(",");
    }
    if (this.state.locdescs.length > 0) {
      var locdescs1 = [];
      var locdescs2 = [];
      var locdescs3 = [];
      for (var i = 0; i < this.state.locdescs.length; i++) {
        locdescs1.push(this.state.locdescs[i][0]);
        locdescs2.push(this.state.locdescs[i][1]);
        locdescs3.push(this.state.locdescs[i][2]);
      }
      params["locdesc1"] = locdescs1.join(",");
      params["locdesc2"] = locdescs2.join(",");
      params["locdesc3"] = locdescs3.join(",");
    }
    var request = {url: be_url+"/city/"+this.state.cityId+"/data", method: "GET"};
    if (params !== {}) {
      request.params = params;
    }
    new Promise((resolve) => axios(request)
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
        data.locdesc_all = response.data.main.all.values_locdesc
        if (blockid !== "") {
          data.date.push({id: blockid, data: response.data.main[blockid].values_date})
          data.time.push({id: blockid, data: response.data.main[blockid].values_time})
          data.dow.push({id: blockid, data: response.data.main[blockid].values_dow})
          data.crime_block = response.data.main[blockid].values_type
          data.locdesc_block = response.data.main[blockid].values_locdesc
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
          dataCrimeTypesBlock: result.crime_block,
          dataLocDescAll: result.locdesc_all,
          dataLocDescBlock: result.locdesc_block
        });
      });
  }
  
  render() {
    return(
      <div>
        <div style={{height: "100vh"}}><MapComponent blockid={this.state.blockid} baseloc={this.state.baseLoc} mapdata={this.state.dataMap} paths={this.state.paths} pathids={this.state.pathids} zipcodePaths={this.state.zipcodePaths} zipcodePathids={this.state.zipcodePathids} /></div>
        {this.state.dataCrimeTypesAll ? <div style={{width: "80vw", height: "60vh"}}><Sunburst data={this.state.dataCrimeTypesAll} /></div> : null}
        {this.state.dataCrimeTypesBlock ? <div style={{width: "80vw", height: "60vh"}}><Sunburst data={this.state.dataCrimeTypesBlock} /></div> : null}
        {this.state.dataLocDescAll ? <div style={{width: "80vw", height: "60vh"}}><Sunburst data={this.state.dataLocDescAll} /></div> : null}
        {this.state.dataLocDescBlock ? <div style={{width: "80vw", height: "60vh"}}><Sunburst data={this.state.dataLocDescBlock} /></div> : null}
        <div style={{width: "80vw", height: "60vh"}}><Line axisbottom={{"format": "%m/%Y", "orient": "bottom", "tickSize": 5, "tickPadding": 5, "tickRotation": 0, "legend": "Month / Year", "legendOffset": 36, "legendPosition": "middle"}} xscale={{"type": "time", "format": "%m/%Y", "min": "auto", "max": "auto"}} yvalue={"Crime Severity"} data={(this.state.dataDate ? this.state.dataDate : [])} /></div>
        <div style={{width: "80vw", height: "60vh"}}><Line axisbottom={{"format": "%I %p", "orient": "bottom", "tickSize": 5, "tickPadding": 5, "tickRotation": 0, "legend": "Hour of Day", "legendOffset": 36, "legendPosition": "middle"}} xscale={{"type": "time", "format": "%H", "min": "auto", "max": "auto"}} yvalue={"Crime Severity"} data={(this.state.dataTime ? this.state.dataTime : [])} /></div>
        <div style={{width: "80vw", height: "60vh"}}><Line axisbottom={{"orient": "bottom", "tickSize": 5, "tickPadding": 5, "tickRotation": 0, "legend": "Day of Week", "legendOffset": 36, "legendPosition": "middle"}} xscale={{"type": "point"}} yvalue={"Crime Severity"} data={(this.state.dataDOTW ? this.state.dataDOTW : [])} /></div>
        <form>
          <input type="number" name="blockid" /><br />
          <input type="date" name="startdate" /><br />
          <input type="date" name="enddate" /><br />
          <input type="number" name="starttime" min="0" max="23" /><br />
          <input type="number" name="endtime" min="0" max="23" /><br />
          <input type="checkbox" name="dotw" value="0" /> Monday<br />
          <input type="checkbox" name="dotw" value="1" /> Tuesday<br />
          <input type="checkbox" name="dotw" value="2" /> Wednesday<br />
          <input type="checkbox" name="dotw" value="3" /> Thursday<br />
          <input type="checkbox" name="dotw" value="4" /> Friday<br />
          <input type="checkbox" name="dotw" value="5" /> Saturday<br />
          <input type="checkbox" name="dotw" value="6" /> Sunday<br />
          <input type="submit" value="data" /> Get Data<br />
          <input type="submit" value="download" /> Download<br />
        </form>
      </div>
    );
  }
}