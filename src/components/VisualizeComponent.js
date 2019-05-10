import React, {Component} from 'react';
import Search from './PlacesSearchBarComponent';
import MapComponent from './MapComponent';
import Line from './LineGraphComponent';
import Sunburst from './SunburstComponent';
import axios from 'axios';
import LoadingLogo from './LoadingLogo';

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
      city: "",
      cities: [],
      showPredictions: false,
      cityId: 1,
      blockid: "",
      startdate: "",
      enddate: "",
      starttime: "",
      endtime: "",
      dotw: [],
      crimetypes: [],
      locdescs: [],
      dataPredictionBlocks: [],
      dataPredictionAll: [],
      dataPredictionDatesFormatted: [],
      dataPredictionDatesInt: [],
      dataPredictionTime: [],
      dataPredictionDate: [],
      dataPredictionDOW: [],
      dataPredictionMap: [],
      dataPredictionSelectedDatesFormatted: [],
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
      baseLoc: {lat: 41.8781, lng: -87.6298},
      startLoading: true,
      finishLoading: false
    }

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
    this.getPredictions = this.getPredictions.bind(this);
    this.showPredictions = this.showPredictions.bind(this);
    this.getCities = this.getCities.bind(this);
    this.changeCity = this.changeCity.bind(this);
    this.selectBlock = this.selectBlock.bind(this);
    this.selectPlace = this.selectPlace.bind(this);
    this.getCityShapes = this.getCityShapes.bind(this);
    this.getCityData = this.getCityData.bind(this);
    this.getDataJob = this.getDataJob.bind(this);
    this.getDownloadJob = this.getDownloadJob.bind(this);
    this.combineDownloadData = this.combineDownloadData.bind(this);
    this.paramsFormSubmit = this.paramsFormSubmit.bind(this);
  }

  componentDidMount() {
    this.getCities();
  }

  getCities() {
    new Promise(resolve => axios({
        url: be_url+"/cities",
        method: 'GET'
      }).then(response => {
        var cities = [];
        for (var i = 0; i < response.data.cities.length; i++) {
          cities.push(<a className="dropdown-item" id={"cityid-"+response.data.cities[i].id.toString()} key={response.data.cities[i].id.toString()} onClick={this.changeCity}>{response.data.cities[i].string}</a>);
        }
        resolve({cities:cities, data: response.data.cities});
      })
    ).then(result => {
      this.setState({
        city: result.data[0].string,
        cityId: result.data[0].id,
        cities: result.cities
      }, () => {
        this.getCityShapes();
        this.getCityData();
      });
    });
  }

  getPredictions() {
    new Promise(resolve => axios({
      url: be_url+"/city/"+this.state.cityId+"/predict",
      method: 'GET'
    }).then(response => {
      resolve(response.data);
    })).then(result => {
      this.setState({
        showPredictions: false,
        dataPredictionBlocks: result.prediction,
        dataPredictionDatesInt: result.allDatesInt,
        dataPredictionDatesFormatted: result.allDatesFormatted,
        dataPredictionAll: result.predictionAll
      }, () => {this.showPredictions()});
    });
  }

  showPredictions() {
    var indexes = [[0,0],[0,1,2,3,4,5,6],[0,23]]
    var datevals = this.state.startdate.split("-")
    var sdt = 2000*12+1-1;
    if (datevals.length === 3) {
      if ((datevals[0] !== "") && (datevals[2] !== "")) {
        sdt = parseInt(datevals[0])+parseInt(datevals[2])*12-1
      }
    }
    datevals = this.state.enddate.split("-")
    var edt = 2100*12+1-1;
    if (datevals.length === 3) {
      if ((datevals[0] !== "") && (datevals[2] !== "")) {
        edt = parseInt(datevals[0])+parseInt(datevals[2])*12-1
      }
    }
    for (var i = 0; i < this.state.dataPredictionDatesInt.length; i++) {
      if (this.state.dataPredictionDatesInt[i] >= sdt) {
        indexes[0][0] = i;
        break;
      }
    }
    for (i = this.state.dataPredictionDatesInt.length-1; i > -1; i++) {
      if (this.state.dataPredictionDatesInt[i] <= edt) {
        indexes[0][1] = i;
        break;
      }
    }
    if (this.state.starttime) {
      indexes[2][0] = parseInt(this.state.starttime);
    }
    if (this.state.endtime) {
      indexes[2][1] = parseInt(this.state.endtime);
    }
    if (this.state.dotw.length > 0) {
      indexes[1] = this.state.dotw.map(x => parseInt(x));
    }
    var formatDates = this.state.dataPredictionDatesFormatted.slice(indexes[0][0], indexes[0][1]);
    var allDate = [];
    var allTime = [];
    var allDOW = [];
    for (i = indexes[0][0]; i < indexes[0][1] + 1; i++) {
      var month = 0.0;
      for (var j = 0; j < indexes[1].length; j++) {
        for (var k = indexes[2][0]; k < indexes[2][1]+1; k++) {
          month += this.state.dataPredictionAll[i][j][k];
        }
      }
      allDate.push({"x": this.state.dataPredictionDatesFormatted[i], "y": (month * (24 * 7) / (indexes[1].length * (1 + indexes[2][1] - indexes[2][0])))**0.1});
    }
    for (k = 0; k < 24; k++) {
      month = 0.0;
      for (j = 0; j < indexes[1].length; j++) {
        for (i = indexes[0][0]; i < indexes[0][1] + 1; i++) {
          month += this.state.dataPredictionAll[i][j][k];
        }
      }
      allTime.push({"x": this.state.dataPredictionDatesFormatted[i], "y": (month * (24 * 7) / (indexes[1].length * 24))**0.1});
    }
    for (j = 0; j < 7; j++) {
      month = 0.0;
      for (i = indexes[0][0]; i < indexes[0][1] + 1; i++) {
        for (k = indexes[2][0]; k < indexes[2][1]+1; k++) {
          month += this.state.dataPredictionAll[i][j][k];
        }
      }
      allDOW.push({"x": this.state.dataPredictionDatesFormatted[i], "y": (month * (24 * 7) / (7 * (1 + indexes[2][1] - indexes[2][0])))**0.1});
    }
    var blockMap = {};
    for (var b in this.state.dataPredictionBlocks) {
      var months = [];
      for (i = indexes[0][0]; i < indexes[0][1] + 1; i++) {
        month = 0.0;
        for (j = 0; j < indexes[1].length; j++) {
          for (k = indexes[2][0]; k < indexes[2][1]+1; k++) {
            month += this.state.dataPredictionBlocks[b][i][j][k];
          }
        }
        months.push({"x": this.state.dataPredictionDatesFormatted[i], "y": (month * (24 * 7) / (indexes[1].length * (1 + indexes[2][1] - indexes[2][0])))**0.1});
      }
      blockMap[b] = months;
    }
    allDate = [{id: "Pred : All", data: allDate}];
    allTime = [{id: "Pred : All", data: allTime}];
    allDOW = [{id: "Pred : All", data: allDOW}];
    if (this.state.blockid !== "") {
      var blockid = parseInt(this.state.blockid);
      var blockDate = [];
      var blockTime = [];
      var blockDOW = [];
      for (i = indexes[0][0]; i < indexes[0][1] + 1; i++) {
        month = 0.0;
        for (j = 0; j < indexes[1].length; j++) {
          for (k = indexes[2][0]; k < indexes[2][1]+1; k++) {
            month += this.state.dataPredictionBlocks[blockid][i][j][k];
          }
        }
        blockDate.push({"x": this.state.dataPredictionDatesFormatted[i], "y": (month * (24 * 7) / (indexes[1].length * (1 + indexes[2][1] - indexes[2][0])))**0.1});
      }
      for (k = 0; k < 24; k++) {
        month = 0.0;
        for (j = 0; j < indexes[1].length; j++) {
          for (i = indexes[0][0]; i < indexes[0][1] + 1; i++) {
            month += this.state.dataPredictionBlocks[blockid][i][j][k];
          }
        }
        blockTime.push({"x": this.state.dataPredictionDatesFormatted[i], "y": (month * (24 * 7) / (indexes[1].length * 24))**0.1});
      }
      for (j = 0; j < 7; j++) {
        month = 0.0;
        for (i = indexes[0][0]; i < indexes[0][1] + 1; i++) {
          for (k = indexes[2][0]; k < indexes[2][1]+1; k++) {
            month += this.state.dataPredictionBlocks[blockid][i][j][k];
          }
        }
        blockDOW.push({"x": this.state.dataPredictionDatesFormatted[i], "y": (month * (24 * 7) / (7 * (1 + indexes[2][1] - indexes[2][0])))**0.1});
      }
      allDate.push({id: "Pred : Block "+blockid.toString(), data: blockDate});
      allTime.push({id: "Pred : Block "+blockid.toString(), data: blockTime});
      allDOW.push({id: "Pred : Block "+blockid.toString(), data: blockDOW});
    }
    this.setState({
      dataPredictionSelectedDatesFormatted: formatDates,
      dataPredictionTime: allTime,
      dataPredictionDate: allDate,
      dataPredictionDOW: allDOW,
      showPredictions: true
    });
  }

  changeCity(e) {
    this.setState({city: e.target.innerHTML, cityId: parseInt(e.target.id.split("-")[1])}, () => {
      this.getCityShapes();
      this.getCityData();
    })
  }

  selectBlock(e) {
    this.setState({blockid: e});
  }

  selectPlace(loc) {
    new Promise(resolve => axios({
      url: be_url+"/cities",
      method: 'GET',
      params: loc
    }).then(response => {
      resolve(response.data);
    })).then(result => {
      this.setState({
        blockid: result.blockid.toString()
      });
    });
  }

  downloadCityData() {
    var params = {};
    if (this.state.startdate !== null) {
      params["sdt"] = this.state.startdate.toString();
    } else {
      params["sdt"] = "01/01/2001";
    }
    if (this.state.enddate !== null) {
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
    for (i = parseInt(sdt_arr[sdt_arr.length-1]); i < 1 + parseInt(edt_arr[edt_arr.length-1]); i++) {
      params["cyear"] = i.toString();
      var request = {
        url: be_url+"/city/"+this.state.cityId+"/download",
        params: JSON.parse(JSON.stringify(params)),
        method: 'GET'
      };
      promises.push(JSON.parse(JSON.stringify(request)));
    }
    
    const promiseSerial = funcs =>
      funcs.reduce((promise, func) =>
        promise.then(result => func().then(Array.prototype.concat.bind(result))),
        Promise.resolve([]));

    var funcs = promises.map(req => () => new Promise((resp) => this.getDownloadJob(req, resp)));
         
    promiseSerial(funcs).then(this.combineDownloadData.bind(this));
  }

  combineDownloadData(res) {
    var out = "city,state,country,datetime,latitude,longitude,category,location_key1,location_key2,location_key3\n"+res.join("");
    const url = window.URL.createObjectURL(new Blob([out]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'download.csv');
    document.body.appendChild(link);
    link.click();
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
        var data = JSON.parse(JSON.stringify(result.data));
        this.getDownloadJob(data, resp);
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
    if (this.state.blockid !== "") {
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
    this.setState({startLoading: true});
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
          data.date = [{id: "All", data: result.main.all.values_date}]
          data.time = [{id: "All", data: result.main.all.values_time}]
          data.dow = [{id: "All", data: result.main.all.values_dow}]
          data.crime_all = result.main.all.values_type
          data.locdesc_all = result.main.all.values_locdesc
          if (blockid !== "") {
            data.date.push({id: blockid.toString(), data: result.main[blockid].values_date})
            data.time.push({id: blockid.toString(), data: result.main[blockid].values_time})
            data.dow.push({id: blockid.toString(), data: result.main[blockid].values_dow})
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
        dataLocDescBlock: result.data.locdesc_block,
        finishLoading: true
      });
    }
  })}

  paramsFormSubmit() {
    var dotw = []
    if (this.formDowM.current.checked) {
      dotw.push("0");
    }
    if (this.formDowTu.current.checked) {
      dotw.push("1");
    }
    if (this.formDowW.current.checked) {
      dotw.push("2");
    }
    if (this.formDowTh.current.checked) {
      dotw.push("3");
    }
    if (this.formDowF.current.checked) {
      dotw.push("4");
    }
    if (this.formDowSa.current.checked) {
      dotw.push("5");
    }
    if (this.formDowSu.current.checked) {
      dotw.push("6");
    }
    var stimes = this.formDateStart.current.value.split("-");
    var etimes = this.formDateEnd.current.value.split("-");
    this.setState({
      startdate: [stimes[1], stimes[2], stimes[0]].join("/"),
      enddate: [etimes[1], etimes[2], etimes[0]].join("/"),
      starttime: this.formTimeStart.current.value,
      endtime: this.formTimeEnd.current.value,
      dotw: dotw,
      showPredictions: false
    }, () => {this.getCityData(); this.showPredictions()});
  }
  
  render() {
    console.log(this.state.dataPredictionDate);
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
        {this.state.startLoading ? <div className="row-nomarg overlay align-items-center text-center"><div className="col-12"><LoadingLogo style={{width: "300px", height: "300px"}} finish={this.state.finishLoading} endLoading={() => this.setState({startLoading: false, finishLoading: false})} /></div></div> : null}
        <div className="col-md-10 offset-1">
          <Search city={this.state.city} cities={this.state.cities} selectPlace={this.selectBlockByAddress} />
          <div className="row"><div style={{width: "100%", height: "80vh"}}><MapComponent height={"80vh"} blockid={this.state.blockid} baseloc={this.state.baseLoc} mapdata={this.state.dataMap} paths={this.state.paths} pathids={this.state.pathids} zipcodePaths={this.state.zipcodePaths} zipcodePathids={this.state.zipcodePathids} selectBlock={this.selectBlock} /></div></div>
          <div className="row">
            <div className="card date-data-chart"><div className="card-img-top" style={{width: "100%", height: "60vh"}}><Line axisbottom={{"format": "%m/%Y", "orient": "bottom", "tickSize": 5, "tickPadding": 5, "tickRotation": 0, "legend": "Month / Year", "legendOffset": 36, "legendPosition": "middle"}} xscale={{"type": "time", "format": "%m/%Y", "min": "auto", "max": "auto"}} yvalue={"Crime Severity"} data={(this.state.dataDate ? (this.state.showPredictions && this.state.dataPredictionDate.length > 0 ? this.state.dataDate.concat(this.state.dataPredictionDate) : this.state.dataDate) : [])} /></div><div className="card-body"><h5 className="card-title">Date (Month/Year)</h5></div></div>
          </div>
          <div className="row">
            <div className="chart-card-columns">
              <div className="card"><div className="card-img-top" style={{width: "100%", height: "60vh"}}><Sunburst data={(this.state.dataCrimeTypesAll ? this.state.dataCrimeTypesAll : {})} /></div><div className="card-body"><h5 className="card-title">Crime Types - All</h5></div></div>
              {this.state.blockid !== "" ? <div className="card"><div className="card-img-top" style={{width: "100%", height: "60vh"}}><Sunburst data={(this.state.dataCrimeTypesBlock ? this.state.dataCrimeTypesBlock : {})} /></div><div className="card-body"><h5 className="card-title">{"Crime Types - Block "+this.state.blockid}</h5></div></div> : null}
              <div className="card"><div className="card-img-top" style={{width: "100%", height: "60vh"}}><Sunburst data={(this.state.dataLocDescAll ? this.state.dataLocDescAll : {})} /></div><div className="card-body"><h5 className="card-title">Location Description - All</h5></div></div>
              {this.state.blockid !== "" ? <div className="card"><div className="card-img-top" style={{width: "100%", height: "60vh"}}><Sunburst data={(this.state.dataLocDescBlock ? this.state.dataLocDescBlock : {})} /></div><div className="card-body"><h5 className="card-title">{"Location Description - Block "+this.state.blockid}</h5></div></div> : null}
              <div className="card"><div className="card-img-top" style={{width: "100%", height: "60vh"}}><Line axisbottom={{"format": d => (d%24 < 12 ? ((d+23)%12+1).toString()+' AM' : ((d+23)%12+1).toString()+' PM'), "orient": "bottom", "tickSize": 5, "tickPadding": 5, "tickRotation": 0, "legend": "Hour of Day", "legendOffset": 36, "legendPosition": "middle", "tickValues": [0, 3, 6, 9, 12, 15, 18, 21, 24]}} xscale={{"type": "linear", "min": -1, "max": 25}} yvalue={"Crime Severity"} data={(this.state.dataTime ? this.state.dataTime : [])} /></div><div className="card-body"><h5 className="card-title">Hour of the Day</h5></div></div>
              <div className="card"><div className="card-img-top" style={{width: "100%", height: "60vh"}}><Line axisbottom={{"format": d => dow[d%7], "orient": "bottom", "tickSize": 5, "tickPadding": 5, "tickRotation": 0, "legend": "Day of Week", "legendOffset": 36, "legendPosition": "middle", "tickValues": [0,1,2,3,4,5,6]}} xscale={{"type": "linear", "min": -1, "max": 7}} yvalue={"Crime Severity"} data={(this.state.dataDOTW ? this.state.dataDOTW : [])} /></div><div className="card-body"><h5 className="card-title">Day of the Week</h5></div></div>
            </div>
          </div>
          <div className="row">
            <form>
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
            </form>
          </div>
          <div className="row"><button className="btn btn-primary" type="button" onClick={() => this.paramsFormSubmit()}>Reload Data</button></div>
          <div className="row"><button className="btn btn-primary" type="button" onClick={() => this.downloadCityData()}>Download</button></div>
          <div className="row"><button className="btn btn-primary" type="button" onClick={() => this.getPredictions()}>Get Predictions</button></div>
        </div>
      </div>
    );
  }
}