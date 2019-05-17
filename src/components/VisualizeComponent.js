import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';
import React, {Component} from 'react';
import Slider, { Range } from 'rc-slider';
import Search from './PlacesSearchBarComponent';
import MapComponent from './MapComponent';
import Line from './LineGraphComponent';
import Sunburst from './SunburstComponent';
import axios from 'axios';
import LoadingLogo from './LoadingLogoComponent';
import {ReactComponent as ChartIcon} from '../images/chart.svg';
import {ReactComponent as DownloadIcon} from '../images/download.svg';
import {ReactComponent as ReloadIcon} from '../images/refresh.svg';
import {ReactComponent as AreaIcon} from '../images/areas.svg';

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

const loadGoogleMaps = (callback) => {
  const existingScript = document.getElementById('googleMaps');

  if (!existingScript) {
    const script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyAiSsYgrWa71hZoeEEKaZZ2SB4nDOJxLsI&libraries=places';
    script.id = 'googleMaps';
    document.body.appendChild(script);

    script.onload = () => {
      if (callback) callback();
    };
  }

  if (existingScript && callback) callback();
};

class LoadButton extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showButton: true
    }
    this.clickButton = this.clickButton.bind(this);
  }

  clickButton() {
    this.setState({showButton: false});
    this.props.loadData();
  }

  render() {
    return(<div className="row-nomarg align-items-center text-center" style={{height: "100%", width: "100%"}}>
      {this.state.showButton ?
        <div className="col-12"><button className="btn btn-primary" style={{height: "100px", width: "100px", borderRadius: "50%", margin: "20px"}} type="button" onClick={this.clickButton} ><ReloadIcon height="48px" width="48px" style={{fill: "#FFFFFF"}} /></button></div> :
        <div className="col-12"><LoadingLogo finish={this.props.finishLoading} endLoading={this.props.onFinish} style={this.props.logoStyle} /></div>
      }
    </div>)
  }
}

export default class VisualizeComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      google: null,
      city: "",
      cities: [],
      showPredictions: false,
      cityId: 1,
      blockid: "",
      nextBlockid: "",
      startdate: "",
      enddate: "",
      starttime: 0,
      endtime: 23,
      dotw: [],
      crimetypes: [],
      locdescs: [],
      lowLocations: [],
      highLocations: [],
      address: null,
      nextAddress: null,
      nextStartdate: "",
      nextEnddate: "",
      nextStarttime: "",
      nextEndtime: "",
      nextDotw: [],
      nextCrimetypes: [],
      nextLocdescs: [],
      dataPredictionBlocks: [],
      dataPredictionAll: [],
      dataPredictionDatesFormatted: [],
      dataPredictionDatesInt: [],
      dataPredictionTime: [],
      dataPredictionDate: [],
      dataPredictionDOW: [],
      dataPredictionMap: [],
      dataPredictionSelectedDatesFormatted: [],
      mapDate: 0,
      dataMap: {},
      dataTimeline: [],
      dataDate: [],
      dataTime: [],
      dataDOTW: [],
      dataCrimeTypesAll: [],
      dataCrimeTypesBlock: [],
      dataLocDescAll: [],
      dataLocDescBlock: [],
      crimeAllShow: false,
      crimeBlockShow: false,
      locAllShow: false,
      locBlockShow: false,
      timeShow: false,
      dowShow: false,
      crimeAllDataLoaded: false,
      crimeBlockDataLoaded: false,
      locAllDataLoaded: false,
      locBlockDataLoaded: false,
      timeDataLoaded: false,
      dowDataLoaded: false,
      paths: null,
      pathids: null,
      zipcodePaths: null,
      zipcodePathids: null,
      baseLoc: {lat: 41.8781, lng: -87.6298},
      startLoading: true,
      finishLoading: false,
      showZipcodes: false,
      formDateStart: "2001-01-01",
      formDateEnd: "2030-01-01",
      formDowM: true,
      formDowTu: true,
      formDowW: true,
      formDowTh: true,
      formDowF: true,
      formDowSa: true,
      formDowSu: true,
      formTimeReverse: false,
      formTimeStart: 0,
      formTimeEnd: 23
    }

    this.currMapSlider = React.createRef();
    
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
    this.loadedMaps = this.loadedMaps.bind(this);

    loadGoogleMaps(this.loadedMaps);
  }

  componentDidMount() {
    document.title = 'SafeSpot - Map';
    this.getCities();
  }

  loadedMaps() {
    /*global google*/
    this.setState({google: google});
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
        this.getCityData("");
      });
    });
  }

  getPredictions() {
    this.setState({startLoading: true});
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
        dataPredictionAll: result.predictionAll,
        finishLoading: true
      }, () => {this.showPredictions()});
    });
  }

  showPredictions() {
    this.setState({
      showPredictions: false
    });
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
      allDate.push({"x": this.state.dataPredictionDatesFormatted[i], "y": (month * (24 * 7)**3 / (indexes[1].length * (1 + indexes[2][1] - indexes[2][0])))**0.1});
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
    if (this.state.nextBlockid !== "") {
      var blockid = parseInt(this.state.nextBlockid);
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
        blockDate.push({"x": this.state.dataPredictionDatesFormatted[i], "y": (month * (24 * 7)**3 / (indexes[1].length * (1 + indexes[2][1] - indexes[2][0])))**0.1});
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
      dataPredictionDOW: allDOW
    }, () => {console.log(this.state)});
  }

  changeCity(e) {
    this.setState({city: e.target.innerHTML, cityId: parseInt(e.target.id.split("-")[1])}, () => {
      this.getCityShapes();
      this.getCityData("");
    })
  }

  selectBlock(e) {
    this.setState({nextBlockid: e});
  }

  selectPlace(loc) {
    console.log(loc);
    new Promise(resolve => axios({
      url: be_url+"/city/"+this.state.cityId.toString()+"/location",
      method: 'GET',
      params: loc
    }).then(response => {
      resolve(response.data);
    })).then(result => {
      if (result.error !== "NO_BLOCK") {
        this.setState({
          nextBlockid: result.blockid.toString(),
          nextAddress: loc
        });
      } else {
        this.setState({
          nextAddress: loc
        });
      }
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

  getCityData(loadtype) {
    var params = {type: loadtype};
    if (this.state.nextBlockid !== "") {
      params["blockid"] = this.state.nextBlockid;
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
    this.getDataJob(request, loadtype);
    if (loadtype === "") {
      this.setState({startLoading: true});
    }
  }

  getDataJob(request, loadtype) {
    new Promise((resolve) => axios(request)
      .then(function(response) {
        if (response.data.status === 'completed') {
          var result = JSON.parse(response.data.result);
          const keys = Object.keys(result.main);
          var blockid = "";
          for (var i = 0; i < keys.length; i++) {
            if (keys[i] !== "all") {
              blockid = keys[i];
              break;
            }
          }
          var data = {blockid: blockid};
          if (loadtype === "") {
            const values = {};
            result.other.forEach(e => {
              values[e.id] = e.values;
            });
            data.values = values;
            data.date = [{id: "All", data: result.main.all.values_date}]
            if (blockid !== "") {
              data.date.push({id: blockid.toString(), data: result.main[blockid].values_date})
            }
            data.timeline = result.timeline;
          } else if (loadtype === "time") {
            data.time = [{id: "All", data: result.main.all.values_time}]
            if (blockid !== "") {
              data.time.push({id: blockid.toString(), data: result.main[blockid].values_time})
            }
          } else if (loadtype === "dow") {
            data.dow = [{id: "All", data: result.main.all.values_dow}]
            if (blockid !== "") {
              data.dow.push({id: blockid.toString(), data: result.main[blockid].values_dow})
            }
          } else if (loadtype === "crimeall") {
            data.crime_all = result.main.all.values_type
          } else if (loadtype === "crimeblock" && blockid !== "") {
            data.crime_block = result.main[blockid].values_type
          } else if (loadtype === "locall") {
            data.locdesc_all = result.main.all.values_locdesc
          } else if (loadtype === "locblock" && blockid !== "") {
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
      this.getDataJob(result.data, loadtype);
    } else {
      if (loadtype === "") {
        this.setState({
          dataMap: result.data.values,
          dataTimeline: result.data.timeline,
          dataDate: result.data.date,
          blockid: result.data.blockid,
          finishLoading: true
        }, () => (this.state.dataPredictionAll.length > 0 ? this.showPredictions() : null));
      } else if (loadtype === "time") {
        this.setState({
          dataTime: result.data.time,
          blockid: result.data.blockid,
          timeDataLoaded: true
        }, () => (this.state.dataPredictionAll.length > 0 ? this.showPredictions() : null));
      } else if (loadtype === "dow") {
        this.setState({
          dataDOTW: result.data.dow,
          blockid: result.data.blockid,
          dowDataLoaded: true
        }, () => (this.state.dataPredictionAll.length > 0 ? this.showPredictions() : null));
      } else if (loadtype === "crimeall") {
        this.setState({
          dataCrimeTypesAll: result.data.crime_all,
          blockid: result.data.blockid,
          crimeAllDataLoaded: true
        }, () => (this.state.dataPredictionAll.length > 0 ? this.showPredictions() : null));
      } else if (loadtype === "crimeblock" && result.data.blockid !== "") {
        this.setState({
          dataCrimeTypesBlock: result.data.crime_block,
          blockid: result.data.blockid,
          crimeBlockDataLoaded: true
        }, () => (this.state.dataPredictionAll.length > 0 ? this.showPredictions() : null));
      } else if (loadtype === "locall") {
        this.setState({
          dataLocDescAll: result.data.locdesc_all,
          blockid: result.data.blockid,
          locAllDataLoaded: true
        }, () => (this.state.dataPredictionAll.length > 0 ? this.showPredictions() : null));
      } else if (loadtype === "locblock" && result.data.blockid !== "") {
        this.setState({
          dataLocDescBlock: result.data.locdesc_block,
          blockid: result.data.blockid,
          locBlockDataLoaded: true
        }, () => (this.state.dataPredictionAll.length > 0 ? this.showPredictions() : null));
      }
    }
  })}

  paramsFormSubmit() {
    var dotw = []
    if (this.state.formDowM) {
      dotw.push("0");
    }
    if (this.state.formDowTu) {
      dotw.push("1");
    }
    if (this.state.formDowW) {
      dotw.push("2");
    }
    if (this.state.formDowTh) {
      dotw.push("3");
    }
    if (this.state.formDowF) {
      dotw.push("4");
    }
    if (this.state.formDowSa) {
      dotw.push("5");
    }
    if (this.state.formDowSu) {
      dotw.push("6");
    }
    var stimes = this.state.formDateStart.split("-");
    var etimes = this.state.formDateEnd.split("-");
    this.setState({
      startdate: [stimes[1], stimes[2], stimes[0]].join("/"),
      enddate: [etimes[1], etimes[2], etimes[0]].join("/"),
      starttime: this.state.formTimeStart,
      endtime: this.state.formTimeEnd,
      dotw: dotw,
      dataCrimeTypesAll: [],
      dataCrimeTypesBlock: [],
      dataLocDescAll: [],
      dataLocDescBlock: [],
      dataTime: [],
      dataDOTW: [],
      showPredictions: false
    }, () => {this.getCityData("")});
  }
  
  render() {
    /*global google*/
    var dow = {
      0: "Mo",
      1: "Tu",
      2: "We",
      3: "Th",
      4: "Fr",
      5: "Sa",
      6: "Su"
    };
    var marks = {};
    if (this.state.dataTimeline.length > 12) {
      for (var i = 0; i < this.state.dataTimeline.length; i++) {
        if (this.state.dataTimeline[i].month === 1) {
          marks[i] = this.state.dataTimeline[i].month.toString()+"/"+this.state.dataTimeline[i].year.toString();
        }
      }
    } else if (this.state.dataTimeline.length > 0) {
      for (i = 0; i < this.state.dataTimeline.length; i+=3) {
        marks[i/3] = this.state.dataTimeline[i].month.toString()+"/"+this.state.dataTimeline[i].year.toString();
      }
    }
    
    return(
      <div>
        {this.state.startLoading ? <div className="row-nomarg overlay align-items-center text-center"><div className="col-12"><LoadingLogo style={{width: "300px", height: "300px"}} finish={this.state.finishLoading} endLoading={() => this.setState({startLoading: false, finishLoading: false})} /></div></div> : null}
        <div className="col-md-10 offset-1">
          <Search google={this.state.google} city={this.state.city} cities={this.state.cities} selectPlace={this.selectPlace} />
          <div className="row"><div style={{width: "100%", height: "80vh"}}><MapComponent highMarkers={this.state.highLocations} lowMarkers={this.state.lowLocations} nextMarker={this.state.nextAddress} currMarker={this.state.address} google={this.state.google} showZipcodes={this.state.showZipcodes} dateindex={this.state.mapDate} height={"80vh"} blockid={this.state.blockid} nextblockid={this.state.nextBlockid} baseloc={this.state.baseLoc} mapdata={this.state.dataMap} paths={this.state.paths} pathids={this.state.pathids} zipcodePaths={this.state.zipcodePaths} zipcodePathids={this.state.zipcodePathids} showZipcodes={this.state.showZipcodes} selectBlock={this.selectBlock} /></div></div>
          <div className="row">
            <div className="card" style={{width: "90vw", padding: "2vw 5vw 1vw 5vw"}}>
              <div className="card-body" style={{width: "100%"}}>
                <h4>Current Map Date</h4>
                <div style={{width: "90%", height: "100px"}}>
                  <Slider step={1} min={0} max={this.state.dataTimeline.length-1}
                    marks={marks}
                    handleStyle={{borderColor: "#54f59a"}}
                    trackStyle={{backgroundColor: "#e9e9e9"}}
                    activeDotStyle={{borderColor: "#e9e9e9"}}
                    onChange={(value) => {this.setState({mapDate: value})}}
                  />
                </div>
                <h5 className="card-title">Date (Month/Year): {this.state.dataTimeline.length > 0 ? this.state.dataTimeline[parseInt(this.state.mapDate)].month.toString()+"/"+this.state.dataTimeline[parseInt(this.state.mapDate)].year.toString() : null}</h5>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="chart-card-columns" style={{width: "100%", height: "100vh"}}>
              <div className="card" style={{height: "95%"}}>
                <div className="card-body">
                  <h4 className="card-title" style={{padding: "30px 0px 10px 0px"}}>Current Settings</h4>
                  <div>
                    <button className={"btn"+(this.state.dataPredictionAll.length > 0 ? (this.state.showPredictions ? " btn-primary" : " btn-outline-primary") : " btn-outline-primary")} style={{height: "50px", borderRadius: "25px", margin: "20px"}} type="button" onClick={() => {
                        if (this.state.dataPredictionAll.length > 0) {
                          this.setState((prevState) => ({showPredictions: !prevState.showPredictions}))
                        } else {
                          this.getPredictions()
                        }
                      }} >
                      <ChartIcon /> Show Predictions
                    </button>
                    <button className={"btn"+(this.state.showZipcodes ? " btn-primary" : " btn-outline-primary")} style={{height: "50px", borderRadius: "25px", margin: "20px"}} type="button" onClick={() => {this.setState((prevState) => ({showZipcodes: !prevState.showZipcodes}))}}>
                      <AreaIcon height="24px" width="24px" /> Show Zipcodes
                    </button>
                    <button className="btn btn-primary" style={{height: "50px", borderRadius: "25px", margin: "20px"}} type="button" onClick={() => this.downloadCityData()}>
                      <DownloadIcon /> Download Incidents
                    </button>
                  </div>
                  <h5>Date Range</h5>
                  <h5>Day of the Week</h5>
                  <h5>Hour of the Day</h5>
                  <Range min={-1} max={25} step={1}
                    disabled={true}
                    handleStyle={[{borderColor: "#54f59a"},{borderColor: "#54f59a"}]}
                    trackStyle={[{backgroundColor: (this.state.starttime > this.state.endtime+1 ? "#ffffff" : "#54f59a")}]}
                    activeDotStyle={{borderColor: (this.state.starttime > this.state.endtime+1 ? "#e9e9e9" : "#54f59a")}}
                    railStyle={{backgroundColor: (this.state.starttime > this.state.endtime+1 ? "#54f59a" : "#ffffff")}}
                    dotStyle={{borderColor: (this.state.starttime > this.state.endtime+1 ? "#54f59a" : "#e9e9e9")}}
                    marks={{
                      0: "12 AM",
                      3: "3 AM",
                      6: "6 AM",
                      9: "9 AM",
                      12: "12 PM",
                      15: "3 PM",
                      18: "6 PM",
                      21: "9 PM",
                      24: "12 AM"
                    }}
                    value={(this.state.starttime > this.state.endtime+1 ? [this.state.endtime+1, this.state.starttime] : [this.state.starttime, this.state.endtime+1])}
                  />
                </div>
              </div>
              <div className="card" style={{height: "95%"}}>
                <div className="card-body">
                  <h4 className="card-title">Next Settings
                    <button className="btn btn-primary" style={{height: "50px", borderRadius: "25px", margin: "20px"}} type="button" onClick={() => this.paramsFormSubmit()}>
                      <ReloadIcon /> Get New Data
                    </button>
                  </h4>
                  <h5>Date Range</h5>
                  <div className="row">
                    <div className="col-5">
                      <h6>Start Date</h6>
                      <input onChange={(e) => {this.setState({formDateStart: e.target.value})}} className="form-control" type="date" value="2000-01-01" name="startdate" />
                    </div>
                    <div className="col-5 offset-2">
                      <h6>End Date</h6>
                      <input onChange={(e) => {this.setState({formDateEnd: e.target.value})}} className="form-control" type="date" value="2030-01-01" name="enddate" />
                    </div>
                  </div>
                  <h5>Day of the Week</h5>
                  <div>
                    <button className={"btn"+(this.state.formDowM ? " btn-primary" : " btn-outline-primary")} style={{height: "50px", width: "50px", borderRadius: "50%", margin: "20px"}} onClick={() => {this.setState((prevState) => ({formDowM: !prevState.formDowM}))}}>M</button>
                    <button className={"btn"+(this.state.formDowTu ? " btn-primary" : " btn-outline-primary")} style={{height: "50px", width: "50px", borderRadius: "50%", margin: "20px"}} onClick={() => {this.setState((prevState) => ({formDowTu: !prevState.formDowTu}))}}>Tu</button>
                    <button className={"btn"+(this.state.formDowW ? " btn-primary" : " btn-outline-primary")} style={{height: "50px", width: "50px", borderRadius: "50%", margin: "20px"}} onClick={() => {this.setState((prevState) => ({formDowW: !prevState.formDowW}))}}>W</button>
                    <button className={"btn"+(this.state.formDowTh ? " btn-primary" : " btn-outline-primary")} style={{height: "50px", width: "50px", borderRadius: "50%", margin: "20px"}} onClick={() => {this.setState((prevState) => ({formDowTh: !prevState.formDowTh}))}}>Th</button>
                    <button className={"btn"+(this.state.formDowF ? " btn-primary" : " btn-outline-primary")} style={{height: "50px", width: "50px", borderRadius: "50%", margin: "20px"}} onClick={() => {this.setState((prevState) => ({formDowF: !prevState.formDowF}))}}>F</button>
                    <button className={"btn"+(this.state.formDowSa ? " btn-primary" : " btn-outline-primary")} style={{height: "50px", width: "50px", borderRadius: "50%", margin: "20px"}} onClick={() => {this.setState((prevState) => ({formDowSa: !prevState.formDowSa}))}}>Sa</button>
                    <button className={"btn"+(this.state.formDowSu ? " btn-primary" : " btn-outline-primary")} style={{height: "50px", width: "50px", borderRadius: "50%", margin: "20px"}} onClick={() => {this.setState((prevState) => ({formDowSu: !prevState.formDowSu}))}}>Su</button>
                  </div>
                  <h5>Hour of the Day</h5>
                  <div>
                  <button onClick={() => {this.setState((prevState) => ({formTimeReverse: !prevState.formTimeReverse}))}} className={"btn"+(this.state.formTimeReverse ? " btn-primary" : " btn-outline-primary")}>Reverse Range</button>
                  </div>
                  <div style={{width: "90%", height: "100px", margin: "5%"}}>
                    <Range min={0} max={24} step={1}
                      onChange={(value) => {
                        if (this.state.formTimeReverse) {
                          this.setState({formTimeStart: value[1]-1, formTimeEnd: value[0]})
                        } else {
                          this.setState({formTimeStart: value[0], formTimeEnd: value[1]-1})
                        }
                      }}
                      handleStyle={[{borderColor: "#54f59a"},{borderColor: "#54f59a"}]}
                      trackStyle={[{backgroundColor: (this.state.formTimeReverse ? "#e9e9e9" : "#54f59a")}]}
                      activeDotStyle={{borderColor: (this.state.formTimeReverse ? "#e9e9e9" : "#54f59a")}}
                      railStyle={{backgroundColor: (this.state.formTimeReverse ? "#54f59a" : "#e9e9e9")}}
                      dotStyle={{borderColor: (this.state.formTimeReverse ? "#54f59a" : "#e9e9e9")}}
                      marks={{
                        0: "12 AM",
                        3: "3 AM",
                        6: "6 AM",
                        9: "9 AM",
                        12: "12 PM",
                        15: "3 PM",
                        18: "6 PM",
                        21: "9 PM",
                        24: "12 AM"
                      }}
                      defaultValue={[0, 24]}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="card date-data-chart"><div className="card-img-top" style={{width: "100%", height: "60vh"}}><Line axisbottom={{"format": "%m/%Y", "orient": "bottom", "tickSize": 5, "tickPadding": 5, "tickRotation": 0, "legend": "Month / Year", "legendOffset": 36, "legendPosition": "middle"}} xscale={{"type": "time", "format": "%m/%Y", "min": "auto", "max": "auto"}} yvalue={"Crime Severity"} data={(this.state.dataDate.length > 0 ? (this.state.showPredictions && this.state.dataPredictionDate.length > 0 ? this.state.dataDate.concat(this.state.dataPredictionDate) : this.state.dataDate) : [])} tooltip={slice => <div><h5>{(slice.id.getMonth()+1).toString()+"/"+(slice.id.getYear()+1900).toString()}</h5>{slice.data.map((e, i) => <p key={i}><span className="dot" style={{backgroundColor: e.serie.color}} />{e.serie.id}: {e.data.y.toFixed(3)}</p>)}</div>} /></div><div className="card-body"><h5 className="card-title">Date (Month/Year)</h5></div></div>
          </div>
          <div className="row">
            <div className="chart-card-columns" style={{width: "100%"}}>
              <div className="card">
                <div className="card-img-top" style={{width: "100%", height: "60vh"}}>
                  {this.state.crimeAllShow ? <Sunburst data={this.state.dataCrimeTypesAll} /> : <LoadButton loadData={() => {this.getCityData("crimeall")}} finishLoading={this.state.crimeAllDataLoaded} onFinish={() => this.setState({crimeAllDataLoaded: false, crimeAllShow: true})} logoStyle={{width: "200px", height: "200px"}} />}
                </div>
                <div className="card-body">
                  <h5 className="card-title">Crime Types - All</h5>
                </div>
              </div>
              {this.state.blockid !== "" ?
                <div className="card">
                  <div className="card-img-top" style={{width: "100%", height: "60vh"}}>
                    {this.state.crimeBlockShow ? <Sunburst data={this.state.dataCrimeTypesBlock} /> : <LoadButton loadData={() => {this.getCityData("crimeblock")}} finishLoading={this.state.crimeBlockDataLoaded} onFinish={() => this.setState({crimeBlockDataLoaded: false, crimeBlockShow: true})} logoStyle={{width: "200px", height: "200px"}} />}
                  </div>
                  <div className="card-body">
                    <h5 className="card-title">{"Crime Types - Block "+this.state.blockid}</h5>
                  </div>
                </div> : 
              null}
              <div className="card">
                <div className="card-img-top" style={{width: "100%", height: "60vh"}}>
                  {this.state.locAllShow ? <Sunburst data={this.state.dataLocDescAll} /> : <LoadButton loadData={() => {this.getCityData("locall")}} finishLoading={this.state.locAllDataLoaded} onFinish={() => this.setState({locAllDataLoaded: false, locAllShow: true})} logoStyle={{width: "200px", height: "200px"}} />}
                </div>
                <div className="card-body">
                  <h5 className="card-title">Location Description - All</h5>
                </div>
              </div>
              {this.state.blockid !== "" ?
                <div className="card">
                  <div className="card-img-top" style={{width: "100%", height: "60vh"}}>
                    {this.state.locBlockShow ? <Sunburst data={this.state.dataLocDescBlock} /> : <LoadButton loadData={() => {this.getCityData("locblock")}} finishLoading={this.state.locBlockDataLoaded} onFinish={() => this.setState({locBlockDataLoaded: false, locBlockShow: true})} logoStyle={{width: "200px", height: "200px"}} />}
                  </div>
                  <div className="card-body">
                    <h5 className="card-title">{"Location Description - Block "+this.state.blockid}</h5>
                  </div>
                </div> :
              null}
              <div className="card">
                <div className="card-img-top" style={{width: "100%", height: "60vh"}}>
                  {this.state.timeShow ? <Line axisbottom={{"format": d => (d%24< 12 ? ((d+23)%12+1).toString()+' AM' : ((d+23)%12+1).toString()+' PM'), "orient": "bottom", "tickSize": 5, "tickPadding": 5, "tickRotation": 0, "legend": "Hour of Day", "legendOffset": 36, "legendPosition": "middle", "tickValues": [0, 3, 6, 9, 12, 15, 18, 21, 24]}} xscale={{"type": "linear", "min": -1, "max": 25}} yvalue={"Crime Severity"} data={this.state.dataTime} tooltip={slice => <div><h5>{(slice.id%24 < 12 ? ((slice.id+23)%12+1).toString()+' AM' : ((slice.id+23)%12+1).toString()+' PM')}</h5>{slice.data.map((e, i) => <p key={i}><span className="dot" style={{backgroundColor: e.serie.color}} />{e.serie.id}: {e.data.y.toFixed(3)}</p>)}</div>} /> : <LoadButton loadData={() => {this.getCityData("time")}} finishLoading={this.state.timeDataLoaded} onFinish={() => this.setState({timeDataLoaded: false, timeShow: true})} logoStyle={{width: "200px", height: "200px"}} />}
                </div>
                <div className="card-body">
                  <h5 className="card-title">Hour of the Day</h5>
                </div>
              </div>
              <div className="card">
                <div className="card-img-top" style={{width: "100%", height: "60vh"}}>
                  {this.state.dowShow ? <Line axisbottom={{"format": d => dow[d%7], "orient": "bottom", "tickSize": 5, "tickPadding": 5, "tickRotation": 0, "legend": "Day of Week", "legendOffset": 36, "legendPosition": "middle", "tickValues": [0,1,2,3,4,5,6]}} xscale={{"type": "linear", "min": -1, "max": 7}} yvalue={"Crime Severity"} data={this.state.dataDOTW} tooltip={slice => <div><h5>{dow[(slice.id+7)%7]}</h5>{slice.data.map((e, i) => <p key={i}><span className="dot" style={{backgroundColor: e.serie.color}} />{e.serie.id}: {e.data.y.toFixed(3)}</p>)}</div>} /> : <LoadButton loadData={() => {this.getCityData("dow")}} finishLoading={this.state.dowDataLoaded} onFinish={() => this.setState({dowDataLoaded: false, dowShow: true})} logoStyle={{width: "200px", height: "200px"}} />}
                </div>
                <div className="card-body">
                  <h5 className="card-title">Day of the Week</h5>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}