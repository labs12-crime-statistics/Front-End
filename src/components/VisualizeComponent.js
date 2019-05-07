import React, {Component} from 'react';
import MapComponent from './MapComponent.js';
import {Line} from './LineGraphComponent.js';
import {Sunburst} from './SunburstComponent.js';
import axios from 'axios';

// const be_url = "http://localhost:5000";
const be_url = "https://crimespot-backend.herokuapp.com";

function delay(t, v) {
  return new Promise(function(resolve) { 
      setTimeout(resolve.bind(null, v), t)
  });
}

Promise.prototype.delay = function(t) {
   return this.then(function(v) {
       return delay(t, v);
   });
}

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

    this.formBlockId = React.createRef();
    this.formDateStart = React.createRef();
    this.formDateEnd = React.createRef();
    this.formTimeStart = React.createRef();
    this.formTimeEnd = React.createRef();
    this.formDowM = React.createRef();
    this.formDowTu = React.createRef();
    this.formDowW = React.createRef();
    this.formDowTh = React.createRef();
    this.formDowF = React.createRef();
    this.formDowSa = React.createRef();
    this.formDowSu = React.createRef();
    
    this.downloadCityData = this.downloadCityData.bind(this);
    this.getCityShapes = this.getCityShapes.bind(this);
    this.getCityData = this.getCityData.bind(this);
    this.getDataJob = this.getDataJob.bind(this);
    this.getDownloadJob = this.getDownloadJob.bind(this);
    this.paramsFormSubmit = this.paramsFormSubmit.bind(this);
  }

  componentDidMount() {
    this.getCityShapes();
    this.getCityData();
  }

  downloadCityData() {
    var params = {};
    if (this.state.startdate !== "") {
      params["sdt"] = this.state.startdate.toString();
    } else {
      params["sdt"] = "01/01/2001";
    }
    if (this.state.enddate !== "") {
      params["edt"] = this.state.enddate.toString();
    } else {
      params["edt"] = "01/01/2020";
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
    var promises = [];
    var sdt_arr = params["sdt"].split("/");
    var edt_arr = params["edt"].split("/");
    for (var i = parseInt(sdt_arr[sdt_arr.length-1]); i < 1 + parseInt(edt_arr[edt_arr.length-1]); i++) {
      params["cyear"] = i.toString();
      var request = {
        url: be_url+"/city/"+this.state.cityId+"/download",
        params: JSON.parse(JSON.stringify(params)),
        method: 'GET'
      };
      promises.push(request);
    }
    
    const promiseSerial = funcs =>
      funcs.reduce((promise, func) =>
        promise.then(result => func().then(Array.prototype.concat.bind(result))),
        Promise.resolve([]));

    var funcs = promises.map(req => () => new Promise((resp) => this.getDownloadJob(req, resp)));
         
    promiseSerial(funcs).then(console.log.bind(console)
      // result => {
      //   console.log(result);
      //   const url = window.URL.createObjectURL(new Blob(result));
      //   const link = document.createElement('a');
      //   link.href = url;
      //   link.setAttribute('download', 'download.csv');
      //   document.body.appendChild(link);
      //   link.click();
      // }
    );
  }

  getDownloadJob(request, resp) {
    new Promise((resolve) => axios(request)
      .then(function(response) {
        if (response.data.status === 'completed') {
          resolve({status: "completed", data: response.data.result});
        } else {
          request.params = {job: response.data.id};
          resolve({status: "pending", data: request});
        }
      })
  ).delay(5000).then(result => {
    if (result.status === "pending") {
      this.getDataJob(result.data);
    } else {
      resp(result.data);
    }
  })}

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
    this.getDataJob(request);
  }

  getDataJob(request) {
    new Promise((resolve) => axios(request)
      .then(function(response) {
        if (response.data.status === 'completed') {
          var result = JSON.parse(response.data.result);
          const values = {};
          result.other.forEach(e => {
            values[e.id] = e.values;
          });
          const keys = Object.keys(result.main);
          var blockid = "";
          for (var i = 0; i < keys.length; i++) {
            if (keys[i] !== "all") {
              blockid = keys[i];
              break;
            }
          }
          var data = {values: values, blockid: blockid};
          data.date = [{id: "all", data: result.main.all.values_date}]
          data.time = [{id: "all", data: result.main.all.values_time}]
          data.dow = [{id: "all", data: result.main.all.values_dow}]
          data.crime_all = result.main.all.values_type
          data.locdesc_all = result.main.all.values_locdesc
          if (blockid !== "") {
            data.date.push({id: blockid, data: result.main[blockid].values_date})
            data.time.push({id: blockid, data: result.main[blockid].values_time})
            data.dow.push({id: blockid, data: result.main[blockid].values_dow})
            data.crime_block = result.main[blockid].values_type
            data.locdesc_block = result.main[blockid].values_locdesc
          }
          resolve({status: "completed", data: data});
        } else {
          request.params = {job: response.data.id};
          resolve({status: "pending", data: request});
        }
      })
  ).delay(5000).then(result => {
    if (result.status === "pending") {
      this.getDataJob(result.data);
    } else {
      this.setState({
        dataMap: result.data.values, 
        dataDate: result.data.date,
        dataTime: result.data.time,
        dataBlockId: result.data.blockid,
        dataDOTW: result.data.dow,
        dataCrimeTypesAll: result.data.crime_all,
        dataCrimeTypesBlock: result.data.crime_block,
        dataLocDescAll: result.data.locdesc_all,
        dataLocDescBlock: result.data.locdesc_block
      });
    }
  })}

  paramsFormSubmit(e) {
    var dotw = []
    if (this.formDowM.checked) {
      dotw.push("0");
    }
    if (this.formDowTu.checked) {
      dotw.push("1");
    }
    if (this.formDowW.checked) {
      dotw.push("2");
    }
    if (this.formDowTh.checked) {
      dotw.push("3");
    }
    if (this.formDowF.checked) {
      dotw.push("4");
    }
    if (this.formDowSa.checked) {
      dotw.push("5");
    }
    if (this.formDowSu.checked) {
      dotw.push("6");
    }
    this.setState({
      blockid: this.formBlockId.value,
      startdate: this.formDateStart.value,
      enddate: this.formDateEnd.value,
      starttime: this.formTimeStart.value,
      endtime: this.formTimeEnd.value,
      dotw: dotw
    }, () => this.getCityData());
  }
  
  render() {
    var dow = {
      0: "Mo",
      1: "Tu",
      2: "We",
      3: "Th",
      4: "Fr",
      5: "Sa",
      6: "Su"
    };
    return(
      <div>
        <div style={{height: "100vh"}}><MapComponent blockid={this.state.blockid} baseloc={this.state.baseLoc} mapdata={this.state.dataMap} paths={this.state.paths} pathids={this.state.pathids} zipcodePaths={this.state.zipcodePaths} zipcodePathids={this.state.zipcodePathids} /></div>
        {this.state.dataCrimeTypesAll ? <div style={{width: "80vw", height: "60vh"}}><Sunburst data={this.state.dataCrimeTypesAll} /></div> : null}
        {this.state.dataCrimeTypesBlock ? <div style={{width: "80vw", height: "60vh"}}><Sunburst data={this.state.dataCrimeTypesBlock} /></div> : null}
        {this.state.dataLocDescAll ? <div style={{width: "80vw", height: "60vh"}}><Sunburst data={this.state.dataLocDescAll} /></div> : null}
        {this.state.dataLocDescBlock ? <div style={{width: "80vw", height: "60vh"}}><Sunburst data={this.state.dataLocDescBlock} /></div> : null}
        <div style={{width: "80vw", height: "60vh"}}><Line axisbottom={{"format": "%m/%Y", "orient": "bottom", "tickSize": 5, "tickPadding": 5, "tickRotation": 0, "legend": "Month / Year", "legendOffset": 36, "legendPosition": "middle"}} xscale={{"type": "time", "format": "%m/%Y", "min": "auto", "max": "auto"}} yvalue={"Crime Severity"} data={(this.state.dataDate ? this.state.dataDate : [])} /></div>
        <div style={{width: "80vw", height: "60vh"}}><Line axisbottom={{"format": d => (d%24 < 12 ? ((d+23)%12+1).toString()+' AM' : ((d+23)%12+1).toString()+' PM'), "orient": "bottom", "tickSize": 5, "tickPadding": 5, "tickRotation": 0, "legend": "Hour of Day", "legendOffset": 36, "legendPosition": "middle", "tickValues": [0, 3, 6, 9, 12, 15, 18, 21, 24]}} xscale={{"type": "linear", "min": -1, "max": 25}} yvalue={"Crime Severity"} data={(this.state.dataTime ? this.state.dataTime : [])} /></div>
        <div style={{width: "80vw", height: "60vh"}}><Line axisbottom={{"format": d => dow[d%7], "orient": "bottom", "tickSize": 5, "tickPadding": 5, "tickRotation": 0, "legend": "Day of Week", "legendOffset": 36, "legendPosition": "middle", "tickValues": [0,1,2,3,4,5,6]}} xscale={{"type": "linear", "min": -1, "max": 7}} yvalue={"Crime Severity"} data={(this.state.dataDOTW ? this.state.dataDOTW : [])} /></div>
        <form onSubmit={this.paramsFormSubmit}>
          <input ref={this.formBlockId} type="number" name="blockid" /><br />
          <input ref={this.formDateStart} type="date" name="startdate" /><br />
          <input ref={this.formDateEnd} type="date" name="enddate" /><br />
          <input ref={this.formTimeStart} type="number" name="starttime" min="0" max="23" /><br />
          <input ref={this.formTimeEnd} type="number" name="endtime" min="0" max="23" /><br />
          <input ref={this.formDowM} type="checkbox" name="dotw" value="0" /> Monday<br />
          <input ref={this.formDowTu} type="checkbox" name="dotw" value="1" /> Tuesday<br />
          <input ref={this.formDowW} type="checkbox" name="dotw" value="2" /> Wednesday<br />
          <input ref={this.formDowTh} type="checkbox" name="dotw" value="3" /> Thursday<br />
          <input ref={this.formDowF} type="checkbox" name="dotw" value="4" /> Friday<br />
          <input ref={this.formDowSa} type="checkbox" name="dotw" value="5" /> Saturday<br />
          <input ref={this.formDowSu} type="checkbox" name="dotw" value="6" /> Sunday<br />
          <input type="submit" value="data" /> Get Data<br />
        </form>
        <a onClick={() => this.downloadCityData()}> Download</a>
      </div>
    );
  }
}