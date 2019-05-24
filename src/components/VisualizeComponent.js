import 'rc-slider/assets/index.css';
import 'rc-tooltip/assets/bootstrap.css';
import React, {Component} from 'react';
import Slider, { Range } from 'rc-slider';
import qs from 'query-string';
import Search from './PlacesSearchBarComponent';
import MapComponent from './MapComponent';
import Line from './LineGraphComponent';
import Pie from './PieComponent';
import axios from 'axios';
import LoadingLogo from './LoadingLogoComponent';
import {ReactComponent as ChartIcon} from '../images/chart.svg';
import {ReactComponent as DownloadIcon} from '../images/download.svg';
import {ReactComponent as ReloadIcon} from '../images/refresh.svg';
import {ReactComponent as AreaIcon} from '../images/areas.svg';

// const be_url = "http://localhost:5000";
const be_url = "https://crimespot-backend.herokuapp.com";
const timeDelay = 1000;

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
    var search_param = qs.parse(this.props.location.search, {ignoreQueryPrefix: true});
    var starttime = 0;
    if (search_param.starttime) {
      starttime = parseInt(search_param.starttime);
    }
    var endtime = 23;
    if (search_param.endtime) {
      endtime = parseInt(search_param.endtime);
    }
    var nextStarttime = starttime;
    var nextEndtime = endtime;
    var nextTimeReverse = false;
    if (endtime < starttime) {
      nextEndtime = starttime;
      nextStarttime = endtime;
      nextTimeReverse = true;
    }
    this.state = {
      google: null,
      city: "",
      cities: [],
      showPredictions: false,
      cityId: (search_param.cityid ? parseInt(search_param.cityid) : 1),
      blockid: (search_param.blockid ? "Block "+search_param.blockid : ""),
      nextBlockid: (search_param.blockid ? search_param.blockid : ""),
      startdate: (search_param.startdate ? search_param.startdate.split("-").join("/") : ""),
      enddate: (search_param.enddate ? search_param.enddate.split("-").join("/") : ""),
      starttime: starttime,
      endtime: endtime,
      dotw: (search_param.dotw ? search_param.dotw.split(",") : []),
      crimevio: (search_param.crimevio ? search_param.crimevio.split(",") : []),
      crimeppo: (search_param.crimeppo ? search_param.crimeppo.split(",") : []),
      locgroups: (search_param.crimeloc ? search_param.crimeloc.split(",") : []),
      formCrimevio: (search_param.crimevio ? search_param.crimevio.split(",") : []),
      formCrimeppo: (search_param.crimeppo ? search_param.crimeppo.split(",") : []),
      formLocgroups: (search_param.crimeppo ? search_param.crimeppo.split(",") : []),
      lowLocations: [],
      highLocations: [],
      address: null,
      nextAddress: null,
      nextStartdate: (search_param.startdate ? search_param.startdate.split("-").join("/") : ""),
      nextEnddate: (search_param.enddate ? search_param.enddate.split("-").join("/") : ""),
      nextStarttime: (search_param.starttime ? parseInt(search_param.starttime) : 0),
      nextEndtime: (search_param.endtime ? parseInt(search_param.endtime) : 23),
      nextDotw: (search_param.dotw ? search_param.dotw.split(",") : []),
      dataPredictionBlocks: [],
      dataPredictionAll: [],
      dataPredictionDatesFormatted: [],
      dataPredictionDatesInt: [],
      dataPredictionTime: [],
      dataPredictionDate: [],
      dataPredictionDOW: [],
      dataPredictionMap: [],
      dataPredictionSelectedDatesFormatted: [],
      dataPredictionMaxRisk: 1.0,
      dataCombinedTimeline: [],
      mapDate: 0,
      dataMap: {},
      dataTimeline: [],
      dataDate: [],
      dataTime: [],
      dataDOTW: [],
      dataCrimeVioAll: [],
      dataCrimeVioBlock: [],
      dataCrimePpoAll: [],
      dataCrimePpoBlock: [],
      dataLocAll: [],
      dataLocBlock: [],
      catAllShow: false,
      catBlockShow: false,
      timeShow: false,
      dowShow: false,
      catAllDataLoaded: 0,
      catBlockDataLoaded: 0,
      timeDataLoaded: 0,
      dowDataLoaded: 0,
      paths: null,
      pathids: null,
      zipcodePaths: null,
      zipcodePathids: null,
      baseLoc: {lat: 41.8781, lng: -87.6298},
      startLoading: true,
      mapLoad: 1,
      showZipcodes: false,
      formDateStart: (search_param.startdate ? search_param.startdate.split("-").join("/") : "2000-01-01"),
      formDateEnd: (search_param.enddate ? search_param.enddate.split("-").join("/") : "2030-01-01"),
      formDowM: (search_param.dotw ? search_param.dotw.split(",").indexOf("0") !== -1 : false),
      formDowTu: (search_param.dotw ? search_param.dotw.split(",").indexOf("1") !== -1 : false),
      formDowW: (search_param.dotw ? search_param.dotw.split(",").indexOf("2") !== -1 : false),
      formDowTh: (search_param.dotw ? search_param.dotw.split(",").indexOf("3") !== -1 : false),
      formDowF: (search_param.dotw ? search_param.dotw.split(",").indexOf("4") !== -1 : false),
      formDowSa: (search_param.dotw ? search_param.dotw.split(",").indexOf("5") !== -1 : false),
      formDowSu: (search_param.dotw ? search_param.dotw.split(",").indexOf("6") !== -1 : false),
      formTimeReverse: nextTimeReverse,
      formTimeStart: nextStarttime,
      formTimeEnd: nextEndtime
    }

    this.currMapSlider = React.createRef();
    
    this.downloadCityData = this.downloadCityData.bind(this);
    this.getPredictions = this.getPredictions.bind(this);
    this.getPredictionJob = this.getPredictionJob.bind(this);
    this.showPredictions = this.showPredictions.bind(this);
    this.getCities = this.getCities.bind(this);
    this.changeCity = this.changeCity.bind(this);
    this.selectBlock = this.selectBlock.bind(this);
    this.selectPlace = this.selectPlace.bind(this);
    this.getCityShapes = this.getCityShapes.bind(this);
    this.getShapeJob = this.getShapeJob.bind(this);
    this.getCityData = this.getCityData.bind(this);
    this.getDataJob = this.getDataJob.bind(this);
    this.getDownloadJob = this.getDownloadJob.bind(this);
    this.combineDownloadData = this.combineDownloadData.bind(this);
    this.paramsFormSubmit = this.paramsFormSubmit.bind(this);
    this.loadedMaps = this.loadedMaps.bind(this);
    this.addCategory = this.addCategory.bind(this);
  }

  componentDidMount() {
    document.title = 'SafeSpot - Map';
    loadGoogleMaps(this.loadedMaps);
    this.getCities();
  }

  loadedMaps() {
    /* global google */
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
        this.getCityShapes(true);
        this.getCityData("map");
        this.getCityData("dateall");
        if (this.state.blockid !== "") {
          this.getCityData("date");
        }
      });
    });
  }

  addCategory(id, typ) {
    if (typ === "loc" && this.state.formLocgroups.indexOf(id) === -1) {
      this.setState((prevState) => ({formLocgroups: prevState.formLocgroups.concat([id])}));
    } else if (typ === "loc") {
      this.setState((prevState) => ({formLocgroups: prevState.formLocgroups.filter((val) => (val !== id))}));
    } else if (typ === "vio" && this.state.formCrimevio.indexOf(id) === -1) {
      this.setState((prevState) => ({formCrimevio: prevState.formCrimevio.concat([id])}));
    } else if (typ === "vio") {
      this.setState((prevState) => ({formCrimevio: prevState.formCrimevio.filter((val) => (val !== id))}));
    } else if (typ === "ppo" && this.state.formCrimeppo.indexOf(id) === -1) {
      this.setState((prevState) => ({formCrimeppo: prevState.formCrimeppo.concat([id])}));
    } else if (typ === "ppo") {
      this.setState((prevState) => ({formCrimeppo: prevState.formCrimeppo.filter((val) => (val !== id))}));
    }
  }

  getPredictions() {
    var request = {url: be_url+"/city/"+this.state.cityId.toString()+"/predict", method: "GET"};
    this.setState((prevState) => ({startLoading: true, mapLoad: prevState.mapLoad+1}));
    this.getPredictionJob(request);
  }

  getPredictionJob(request) {
    new Promise((resolve) => axios(request)
      .then(response => {
        if (response.data.status === 'completed') {
          resolve({status: "completed", data: JSON.parse(response.data.result)});
        } else {
          request.params = {job: response.data.id};
          resolve({status: "pending", data: request});
        }
      })
    ).delay(timeDelay).then(result => {
      if (result.status === "pending") {
        this.getPredictionJob(result.data);
      } else {
        this.setState((prevState) => ({
          showPredictions: false,
          dataPredictionBlocks: result.data.prediction,
          dataPredictionDatesInt: result.data.allDatesInt,
          dataPredictionDatesFormatted: result.data.allDatesFormatted,
          dataPredictionAll: result.data.predictionAll,
          dataPredictionMaxRisk: result.data.maxRisk,
          mapLoad: prevState.mapLoad-1
        }), () => {this.showPredictions()});
      }
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
      allDate.push({"x": this.state.dataPredictionDatesFormatted[i], "y": (month * 24 * 7 / (1000.0 * indexes[1].length * (1 + indexes[2][1] - indexes[2][0])))});
    }
    for (k = 0; k < 24; k++) {
      month = 0.0;
      for (j = 0; j < indexes[1].length; j++) {
        for (i = indexes[0][0]; i < indexes[0][1] + 1; i++) {
          month += this.state.dataPredictionAll[i][j][k];
        }
      }
      allTime.push({"x": this.state.dataPredictionDatesFormatted[i], "y": (month * 24 * 7 / (1000.0 * indexes[1].length * 24))});
    }
    for (j = 0; j < 7; j++) {
      month = 0.0;
      for (i = indexes[0][0]; i < indexes[0][1] + 1; i++) {
        for (k = indexes[2][0]; k < indexes[2][1]+1; k++) {
          month += this.state.dataPredictionAll[i][j][k];
        }
      }
      allDOW.push({"x": this.state.dataPredictionDatesFormatted[i], "y": (month * 24 * 7 / (1000.0 * 7 * (1 + indexes[2][1] - indexes[2][0])))});
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
        months.push({"id": b, "values": (month / (this.state.dataPredictionMaxRisk * indexes[1].length * (1 + indexes[2][1] - indexes[2][0])))**0.2});
      }
      blockMap[b] = months;
    }
    allDate = [{id: "Pred : All", data: allDate}];
    allTime = [{id: "Pred : All", data: allTime}];
    allDOW = [{id: "Pred : All", data: allDOW}];
    if (this.state.blockid !== "") {
      var blockid = parseInt(this.state.blockid.split(" ")[1]);
      var blockDate = [];
      var blockTime = [];
      var blockDOW = [];
      console.log(blockid);
      for (i = indexes[0][0]; i < indexes[0][1] + 1; i++) {
        month = 0.0;
        for (j = 0; j < indexes[1].length; j++) {
          for (k = indexes[2][0]; k < indexes[2][1]+1; k++) {
            month += this.state.dataPredictionBlocks[blockid][i][j][k];
          }
        }
        blockDate.push({"x": this.state.dataPredictionDatesFormatted[i], "y": (month * 24 * 7 / (1000.0 * indexes[1].length * (1 + indexes[2][1] - indexes[2][0])))});
      }
      for (k = 0; k < 24; k++) {
        month = 0.0;
        for (j = 0; j < indexes[1].length; j++) {
          for (i = indexes[0][0]; i < indexes[0][1] + 1; i++) {
            month += this.state.dataPredictionBlocks[blockid][i][j][k];
          }
        }
        blockTime.push({"x": this.state.dataPredictionDatesFormatted[i], "y": (month * 24 * 7 / (1000.0 * indexes[1].length * 24))});
      }
      for (j = 0; j < 7; j++) {
        month = 0.0;
        for (i = indexes[0][0]; i < indexes[0][1] + 1; i++) {
          for (k = indexes[2][0]; k < indexes[2][1]+1; k++) {
            month += this.state.dataPredictionBlocks[blockid][i][j][k];
          }
        }
        blockDOW.push({"x": this.state.dataPredictionDatesFormatted[i], "y": (month * 24 * 7 / (1000.0 * 7 * (1 + indexes[2][1] - indexes[2][0])))});
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
      dataPredictionMap: blockMap
    }, () => {
      var timeline = JSON.parse(JSON.stringify(this.state.dataTimeline));
      var combmap = JSON.parse(JSON.stringify(this.state.dataMap));
      var end_time = timeline[timeline.length-1].month-1+timeline[timeline.length-1].year*12;
      var pred_start_time = this.state.dataPredictionSelectedDatesFormatted[0].month-1+this.state.dataPredictionSelectedDatesFormatted[0].year*12;
      if (pred_start_time > end_time) {
        for (var k=end_time+1; k < pred_start_time; k++) {
          for (var l in combmap) {
            combmap[l].push(0.0);
            timeline.push({year: Math.floor(k/12), month: k%12+1})
          }
        }
        for (k=0; k < 12; k++) {
          for (l in combmap) {
            combmap[l].push(this.state.dataPredictionMap[l][k]);
          }
        }
      } else if (pred_start_time + 12 > end_time) {
        for (k=end_time-pred_start_time; k < 12; k++) {
          combmap[l].push(this.state.dataPredictionMap[l][k]);
        }
      }
      this.setState({
        showPredictions: true,
        dataCombinedTimeline: timeline,
        dataCombinedMap: combmap
      });
    });
  }

  changeCity(e) {
    this.setState({city: e.target.innerHTML, cityId: parseInt(e.target.id.split("-")[1])}, () => {
      this.getCityShapes();
      this.getCityData("map");
      this.getCityData("dateall");
    })
  }

  selectBlock(e) {
    this.setState({nextBlockid: e});
  }

  selectPlace(loc) {
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
    ).delay(timeDelay).then(result => {
      if (result.status === "pending") {
        var data = JSON.parse(JSON.stringify(result.data));
        this.getDownloadJob(data, resp);
      } else {
        resp(result.data);
      }
  })}

  getCityShapes(starting) {
    var request = {url: be_url+"/city/"+this.state.cityId+"/shapes", method: "GET"};
    this.getShapeJob(request, starting);
    this.setState((prevState) => ({mapLoad: prevState.mapLoad+1}));
  }

  getShapeJob(request, starting) {
    new Promise((resolve) => axios(request)
      .then(function(response) {
        if (response.data.status === 'completed') {
          var data = JSON.parse(response.data.result);
          var shapes = [];
          var shapeids = [];
          var coords = {lat: data.citylocation[0], lng: data.citylocation[1]};
          data.blocks.forEach((s) => {
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
          data.zipcodes.forEach((s) => {
            var paths = [];
            s.shape[0].forEach(si => {
              var paths2 = [];
              si.forEach(sj => {paths2.push({lat: sj[1], lng: sj[0]})});
              paths.push(paths2);
            });
            zipcodeShapes.push(paths);
            zipcodes.push(s.zipcode);
          });
          data = {
            shapes: shapes,
            shapeids: shapeids,
            zipcodeShapes: zipcodeShapes,
            zipcodes: zipcodes,
            coords: coords
          };
          resolve({status: "completed", data: data});
        } else {
          request.params = {job: response.data.id};
          resolve({status: "pending", data: request});
        }
      })
    ).delay(timeDelay).then((result) => {
      if (result.status === "pending") {
        this.getShapeJob(result.data, starting);
      } else {
        this.setState((prevState) => ({
          paths: result.data.shapes,
          pathids: result.data.shapeids,
          zipcodePaths: result.data.zipcodeShapes,
          zipcodePathids: result.data.zipcodes,
          baseLoc: result.data.coords,
          mapLoad: prevState.mapLoad-(starting ? 2 : 1)
        }));
      }
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
    if (this.state.crimevio.length > 0) {
      params["crimeviolence"] = this.state.crimevio.join(",");
    }
    if (this.state.crimeppo.length > 0) {
      params["crimeppos"] = this.state.crimeppo.join(",");
    }
    if (this.state.locgroups.length > 0) {
      params["locgroups"] = this.state.locgroups.join(",");
    }
    var request = {url: be_url+"/city/"+this.state.cityId+"/data", method: "GET"};
    if (params !== {}) {
      request.params = params;
    }
    if (loadtype === "catall") {
      var req = JSON.parse(JSON.stringify(request));
      req.params.type = "crimevioall";
      this.getDataJob(req, "crimevioall");
      req = JSON.parse(JSON.stringify(request));
      req.params.type = "crimeppoall";
      this.getDataJob(req, "crimeppoall");
      req = JSON.parse(JSON.stringify(request));
      req.params.type = "locall";
      this.getDataJob(req, "locall");
      this.setState((prevState) => ({catDataLoaded: prevState.catAllDataLoaded+3}));
    } else if (loadtype === "cat") {
      req = JSON.parse(JSON.stringify(request));
      req.params.type = "crimevioblock";
      this.getDataJob(req, "crimevioblock");
      req = JSON.parse(JSON.stringify(request));
      req.params.type = "crimeppoblock";
      this.getDataJob(req, "crimeppoblock");
      req = JSON.parse(JSON.stringify(request));
      req.params.type = "locblock";
      this.getDataJob(req, "locblock");
      this.setState((prevState) => ({catDataLoaded: prevState.catBlockDataLoaded+3}));
    } else {
      this.getDataJob(request, loadtype);
      if (['map', 'dateall', 'date'].indexOf(loadtype) !== -1) {
        this.setState((prevState) => ({mapLoad: prevState.mapLoad+1, startLoading: true}));
      } else if (['time', 'timeall'].indexOf(loadtype) !== -1) {
        this.setState((prevState) => ({timeDataLoaded: prevState.timeDataLoaded+1}));
      } else if (['dow', 'dowall'].indexOf(loadtype) !== -1) {
        this.setState((prevState) => ({dowDataLoaded: prevState.dowDataLoaded+1}));
      } 
    }
  }

  getDataJob(request, loadtype) {
    new Promise((resolve) => axios(request)
      .then(function(response) {
        if (response.data.status === 'completed') {
          var result = JSON.parse(response.data.result);
          var data = {};
          if (loadtype !== "map") {
            const keys = Object.keys(result.main);
            var blockid = "";
            for (var i = 0; i < keys.length; i++) {
              if (keys[i] !== "all") {
                blockid = keys[i];
                break;
              }
            }
            data = {blockid: blockid};
          }
          if (loadtype === "map") {
            const values = {};
            result.other.forEach(e => {
              values[e.id] = e.values;
            });
            data.values = values;
            data.timeline = result.timeline;
          } else if (loadtype === "dateall") {
            data.dateall = [{id: "All", data: result.main.all.values_date}];
          } else if (blockid !== "" && loadtype === "date") {
            data.dateblock = [{id: blockid.toString(), data: result.main[blockid].values_date}];
          } else if (loadtype === "timeall") {
            data.timeall = [{id: "All", data: result.main.all.values_time}];
          } else if (loadtype === "time" && blockid !== "") {
            data.timeblock = [{id: blockid.toString(), data: result.main[blockid].values_time}];
          } else if (loadtype === "dowall") {
            data.dowall = [{id: "All", data: result.main.all.values_dow}];
          } else if (loadtype === "dow" && blockid !== "") {
            data.dowblock = [{id: blockid.toString(), data: result.main[blockid].values_dow}];
          } else if (loadtype === "crimevioall") {
            data.crimevio_all = result.main.all.values_type
          } else if (loadtype === "crimevioblock" && blockid !== "") {
            data.crimevio_block = result.main[blockid].values_type
          } else if (loadtype === "crimeppoall") {
            data.crimeppo_all = result.main.all.values_type
          } else if (loadtype === "crimeppoblock" && blockid !== "") {
            data.crimeppo_block = result.main[blockid].values_type
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
  ).delay(timeDelay).then(result => {
    if (result.status === "pending") {
      this.getDataJob(result.data, loadtype);
    } else {
      if (loadtype === "map") {
        this.setState((prevState) => ({
          dataMap: result.data.values,
          dataTimeline: result.data.timeline,
          mapLoad: prevState.mapLoad-1
        }), () => (this.state.dataPredictionAll.length > 0 ? this.showPredictions() : null));
      } else if (loadtype === "dateall") {
        this.setState((prevState) => ({
          dataDate: (prevState.dataDate.length > 0 ? prevState.dataDate.concat(result.data.dateall) : result.data.dateall),
          mapLoad: prevState.mapLoad-1
        }), () => (this.state.dataPredictionAll.length > 0 ? this.showPredictions() : null));
      } else if (loadtype === "date") {
        this.setState((prevState) => ({
          dataDate: (prevState.dataDate.length > 0 ? prevState.dataDate.concat(result.data.dateblock) : result.data.dateblock),
          blockid: result.data.blockid,
          mapLoad: prevState.mapLoad-1
        }), () => (this.state.dataPredictionAll.length > 0 ? this.showPredictions() : null));
      } else if (loadtype === "timeall") {
        this.setState((prevState) => ({
          dataTime: (prevState.dataTime.length > 0 ? prevState.dataTime.concat(result.data.timeall) : result.data.timeall),
          timeDataLoaded: prevState.timeDataLoaded-1
        }), () => (this.state.dataPredictionAll.length > 0 ? this.showPredictions() : null));
      } else if (loadtype === "time") {
        this.setState((prevState) => ({
          dataTime: (prevState.dataTime.length > 0 ? prevState.dataTime.concat(result.data.timeblock) : result.data.timeblock),
          timeDataLoaded: prevState.timeDataLoaded-1
        }), () => (this.state.dataPredictionAll.length > 0 ? this.showPredictions() : null));
      } else if (loadtype === "dowall") {
        this.setState((prevState) => ({
          dataDOTW: (prevState.dataDOTW.length > 0 ? prevState.dataDOTW.concat(result.data.dowall) : result.data.dowall),
          dowDataLoaded: prevState.dowDataLoaded-1
        }), () => (this.state.dataPredictionAll.length > 0 ? this.showPredictions() : null));
      } else if (loadtype === "dow") {
        this.setState((prevState) => ({
          dataDOTW: (prevState.dataDOTW.length > 0 ? prevState.dataDOTW.concat(result.data.dowblock) : result.data.dowblock),
          dowDataLoaded: prevState.dowDataLoaded-1
        }), () => (this.state.dataPredictionAll.length > 0 ? this.showPredictions() : null));
      } else if (loadtype === "crimevioall") {
        this.setState((prevState) => ({
          dataCrimeVioAll: result.data.crimevio_all,
          crimeAllDataLoaded: prevState.catAllDataLoaded-1
        }), () => {
          if (this.state.dataPredictionAll.length > 0) {
            this.showPredictions()
          }
          if (this.state.catAllDataLoaded === 0) {
            this.setState({
              catAllShow: true
            });
          }
        });
      } else if (loadtype === "crimevioblock" && result.data.blockid !== "") {
        this.setState((prevState) => ({
          dataCrimeVioBlock: result.data.crimevio_block,
          catBlockDataLoaded: prevState.catBlockDataLoaded-1
        }), () => {
          if (this.state.dataPredictionAll.length > 0) {
            this.showPredictions()
          }
          if (this.state.catBlockDataLoaded === 0) {
            this.setState({
              catBlockShow: true
            });
          }
        });
      } else if (loadtype === "crimeppoall") {
        this.setState((prevState) => ({
          dataCrimePpoAll: result.data.crimeppo_all,
          crimeAllDataLoaded: prevState.catAllDataLoaded-1
        }), () => {
          if (this.state.dataPredictionAll.length > 0) {
            this.showPredictions()
          }
          if (this.state.catAllDataLoaded === 0) {
            this.setState({
              catAllShow: true
            });
          }
        });
      } else if (loadtype === "crimeppoblock" && result.data.blockid !== "") {
        this.setState((prevState) => ({
          dataCrimePpoBlock: result.data.crimeppo_block,
          catBlockDataLoaded: prevState.catBlockDataLoaded-1
        }), () => {
          if (this.state.dataPredictionAll.length > 0) {
            this.showPredictions()
          }
          if (this.state.catBlockDataLoaded === 0) {
            this.setState({
              catBlockShow: true
            });
          }
        });
      } else if (loadtype === "locall") {
        this.setState((prevState) => ({
          dataLocAll: result.data.locdesc_all,
          locAllDataLoaded: prevState.catAllDataLoaded-1
        }), () => {
          if (this.state.dataPredictionAll.length > 0) {
            this.showPredictions()
          }
          if (this.state.catAllDataLoaded === 0) {
            this.setState({
              catAllShow: true
            });
          }
        });
      } else if (loadtype === "locblock" && result.data.blockid !== "") {
        this.setState((prevState) => ({
          dataLocBlock: result.data.locdesc_block,
          catBlockDataLoaded: prevState.catBlockDataLoaded-1
        }), () => {
          if (this.state.dataPredictionAll.length > 0) {
            this.showPredictions()
          }
          if (this.state.catBlockDataLoaded === 0) {
            this.setState({
              catBlockShow: true
            });
          }
        });
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
      crimevio: this.state.formCrimevio,
      crimeppo: this.state.formCrimeppo,
      locgroups: this.state.formLocgroups,
      dataMap: {},
      dataDate: [],
      dataCrimeVioAll: [],
      dataCrimeVioBlock: [],
      dataCrimePpoAll: [],
      dataCrimePpoBlock: [],
      dataLocAll: [],
      dataLocBlock: [],
      dataTime: [],
      dataDOTW: [],
      showPredictions: false,
      catAllShow: false,
      catBlockShow: false
    }, () => {
      this.getCityData("map");
      this.getCityData("dateall");
      if (this.state.nextBlockid !== "") {
        this.getCityData("date");
      }
    });
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
    var timeline_start = 0;
    var timeline_end = 0;
    if (this.state.dataTimeline.length > 0) {
      timeline_start = this.state.dataTimeline[0].month-1 + this.state.dataTimeline[0].year * 12;
      timeline_end = this.state.dataTimeline[this.state.dataTimeline.length-1].month-1 + this.state.dataTimeline[this.state.dataTimeline.length-1].year * 12;
    }
    if (this.state.dataTimeline.length > 12) {
      for (var i = 0; i < timeline_end - timeline_start + 1; i++) {
        if (i%12 === 0) {
          marks[i] = ((i+timeline_start)%12+1).toString()+"/"+Math.floor((i+timeline_start)/12).toString();
        }
      }
    } else if (this.state.dataTimeline.length > 0) {
      for (i = 0; i < timeline_end - timeline_start + 1; i++) {
        marks[i] = ((i+timeline_start)%12+1).toString()+"/"+Math.floor((i+timeline_start)/12).toString();
      }
    }
    
    return(
      <div>
        {this.state.startLoading ? <div className="row-nomarg overlay align-items-center text-center"><div className="col-12"><LoadingLogo style={{width: "300px", height: "300px"}} finish={this.state.mapLoad === 0} endLoading={() => this.setState({startLoading: false, mapLoad: 0})} /></div></div> : null}
        <div className="col-md-10 offset-1">
          <Search google={this.state.google} city={this.state.city} cities={this.state.cities} selectPlace={this.selectPlace} selecCity={this.changeCity} />
          <div className="row"><div style={{width: "100%", height: "80vh"}}><MapComponent highMarkers={this.state.highLocations} lowMarkers={this.state.lowLocations} nextMarker={this.state.nextAddress} currMarker={this.state.address} google={this.state.google} showZipcodes={this.state.showZipcodes} dateindex={this.state.mapDate} height={"80vh"} blockid={this.state.blockid} nextblockid={this.state.nextBlockid} baseloc={this.state.baseLoc} mapdata={this.state.dataMap} paths={this.state.paths} pathids={this.state.pathids} zipcodePaths={this.state.zipcodePaths} zipcodePathids={this.state.zipcodePathids} selectBlock={this.selectBlock} /></div></div>
          <div className="row">
            <div className="card" style={{width: "90vw", padding: "2vw 5vw 1vw 5vw"}}>
              <div className="card-body" style={{width: "100%"}}>
                <h4>Current Map Date</h4>
                <div style={{width: "100%", height: "100px"}}>
                  <Slider step={1} min={0} max={timeline_end-timeline_start+1}
                    marks={marks}
                    handleStyle={{borderColor: "#54f59a"}}
                    trackStyle={{backgroundColor: "#e9e9e9"}}
                    activeDotStyle={{borderColor: "#e9e9e9"}}
                    onChange={(value) => {
                      for (i=0; i < this.state.dataTimeline.length; i++) {
                        if (value === this.state.dataTimeline[i].month-1+this.state.dataTimeline[i].year*12-timeline_start) {
                          this.setState({mapDate: i});
                          break;
                        }
                      }
                    }}
                  />
                </div>
                <h5 className="card-title">Date (Month/Year): {this.state.dataTimeline.length > 0 ? this.state.dataTimeline[parseInt(this.state.mapDate)].month.toString()+"/"+this.state.dataTimeline[parseInt(this.state.mapDate)].year.toString() : null}</h5>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="chart-card-columns" style={{width: "100%"}}>
              <div className="card">
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
                  {this.state.blockid !== "" ?
                    <div>
                      <h5>Block ID</h5>
                      <p>{this.state.blockid}</p>
                    </div>
                  : null}
                  <h5>Date Range</h5>
                  <div className="row">
                    <div className="col-5">
                      <h6>Start Date</h6>
                      <input disabled className="form-control" type="date" value={this.state.startdate.split("/").reverse().join("-")} name="startdate" />
                    </div>
                    <div className="col-5 offset-2">
                      <h6>End Date</h6>
                      <input disabled className="form-control" type="date" value={this.state.enddate.split("/").reverse().join("-")} name="enddate" />
                    </div>
                  </div>
                  <h5>Day of the Week</h5>
                  <div>
                    <button className={"btn"+(this.state.dotw.length === 0 || this.state.dotw.indexOf("0") !== -1 ? " btn-primary" : " btn-outline-primary")} style={{height: "50px", width: "50px", borderRadius: "50%", margin: "20px"}} disabled>M</button>
                    <button className={"btn"+(this.state.dotw.length === 0 || this.state.dotw.indexOf("1") !== -1 ? " btn-primary" : " btn-outline-primary")} style={{height: "50px", width: "50px", borderRadius: "50%", margin: "20px"}} disabled>Tu</button>
                    <button className={"btn"+(this.state.dotw.length === 0 || this.state.dotw.indexOf("2") !== -1 ? " btn-primary" : " btn-outline-primary")} style={{height: "50px", width: "50px", borderRadius: "50%", margin: "20px"}} disabled>W</button>
                    <button className={"btn"+(this.state.dotw.length === 0 || this.state.dotw.indexOf("3") !== -1 ? " btn-primary" : " btn-outline-primary")} style={{height: "50px", width: "50px", borderRadius: "50%", margin: "20px"}} disabled>Th</button>
                    <button className={"btn"+(this.state.dotw.length === 0 || this.state.dotw.indexOf("4") !== -1 ? " btn-primary" : " btn-outline-primary")} style={{height: "50px", width: "50px", borderRadius: "50%", margin: "20px"}} disabled>F</button>
                    <button className={"btn"+(this.state.dotw.length === 0 || this.state.dotw.indexOf("5") !== -1 ? " btn-primary" : " btn-outline-primary")} style={{height: "50px", width: "50px", borderRadius: "50%", margin: "20px"}} disabled>Sa</button>
                    <button className={"btn"+(this.state.dotw.length === 0 || this.state.dotw.indexOf("6") !== -1 ? " btn-primary" : " btn-outline-primary")} style={{height: "50px", width: "50px", borderRadius: "50%", margin: "20px"}} disabled>Su</button>
                  </div>
                  <h5>Hour of the Day</h5>
                  <div style={{width: "90%", height: "100px", margin: "5%"}}>
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
                  {this.state.crimevio.length > 0 ?
                    <div>
                      <h5>Crime Violence Categories</h5>
                      <div>
                        {this.state.crimevio.map(x => <button style={{height: "40px", borderRadius: "20px", margin: "20px"}} type="button" className="btn btn-outline-primary" disabled>{x}</button>)}
                      </div>
                    </div>
                  : null}
                  {this.state.crimeppo.length > 0 ?
                    <div>
                      <h5>Crime Target Categories</h5>
                      <div>
                        {this.state.crimeppo.map(x => <button style={{height: "40px", borderRadius: "20px", margin: "20px"}} type="button" className="btn btn-outline-primary" disabled>{x}</button>)}
                      </div>
                    </div>
                  : null}
                  {this.state.locgroups.length > 0 ?
                    <div>
                      <h5>Crime Location Categories</h5>
                      <div>
                        {this.state.locgroups.map(x => <button style={{height: "40px", borderRadius: "20px", margin: "20px"}} type="button" className="btn btn-outline-primary" disabled>{x}</button>)}
                      </div>
                    </div>
                  : null}
                </div>
              </div>
              <div className="card">
                <div className="card-body">
                  <h4 className="card-title">Next Settings
                    <button className="btn btn-primary" style={{height: "50px", borderRadius: "25px", margin: "20px"}} type="button" onClick={() => this.paramsFormSubmit()}>
                      <ReloadIcon /> Get New Data
                    </button>
                  </h4>
                  {this.state.nextBlockid !== "" ?
                    <div>
                      <h5>Block ID <button className="btn btn-primary" style={{height: "40px", borderRadius: "20px", margin: "10px"}} type="button" onClick={() => {this.setState({nextBlockid: ""})}}>Remove Block ID</button></h5>
                      <p>Block {this.state.nextBlockid}</p>
                    </div>
                  : null}
                  <h5>Date Range</h5>
                  <div className="row">
                    <div className="col-5">
                      <h6>Start Date</h6>
                      <input onChange={(e) => {this.setState({formDateStart: e.target.value})}} className="form-control" type="date" defaultValue="2000-01-01" name="startdate" />
                    </div>
                    <div className="col-5 offset-2">
                      <h6>End Date</h6>
                      <input onChange={(e) => {this.setState({formDateEnd: e.target.value})}} className="form-control" type="date" defaultValue="2030-01-01" name="enddate" />
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
                  {this.state.formCrimevio.length > 0 ?
                    <div>
                      <h5>Crime Violence Categories</h5>
                      <div>
                        {this.state.formCrimevio.map(x => <button style={{height: "40px", borderRadius: "20px", margin: "20px"}} type="button" className="btn btn-primary" onClick={(e) => {
                          var n_array = [];
                          for (var i=0; i < this.state.formCrimevio.length; i++) {
                            if (this.state.formCrimevio[i] !== e.target.innerText) {
                              n_array.push(this.state.formCrimevio[i]);
                            }
                          }
                          this.setState({formCrimevio: n_array});
                        }}>{x}</button>)}
                      </div>
                    </div>
                  : null}
                  {this.state.formCrimeppo.length > 0 ?
                    <div>
                      <h5>Crime Target Categories</h5>
                      <div>
                        {this.state.formCrimeppo.map(x => <button style={{height: "40px", borderRadius: "20px", margin: "20px"}} type="button" className="btn btn-primary" onClick={(e) => {
                          var n_array = [];
                          for (var i=0; i < this.state.formCrimeppo.length; i++) {
                            if (this.state.formCrimeppo[i] !== e.target.innerText) {
                              n_array.push(this.state.formCrimeppo[i]);
                            }
                          }
                          this.setState({formCrimeppo: n_array});
                        }}>{x}</button>)}
                      </div>
                    </div>
                  : null}
                  {this.state.formLocgroups.length > 0 ?
                    <div>
                      <h5>Crime Location Categories</h5>
                      <div>
                        {this.state.formLocgroups.map(x => <button style={{height: "40px", borderRadius: "20px", margin: "20px"}} type="button" className="btn btn-primary" onClick={(e) => {
                          var n_array = [];
                          for (var i=0; i < this.state.formLocgroups.length; i++) {
                            if (this.state.formLocgroups[i] !== e.target.innerText) {
                              n_array.push(this.state.formLocgroups[i]);
                            }
                          }
                          this.setState({formLocgroups: n_array});
                        }}>{x}</button>)}
                      </div>
                    </div>
                  : null}
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="card date-data-chart"><div className="card-img-top" style={{width: "100%", height: "60vh"}}>
              <Line axisbottom={{"format": "%m/%Y", "orient": "bottom", "tickSize": 5, "tickPadding": 5, "tickRotation": 0, "legend": "Month / Year", "legendOffset": 36, "legendPosition": "middle"}} xscale={{"type": "time", "format": "%m/%Y", "min": "auto", "max": "auto"}} yvalue={"Average Crime Count / (1k Population * Year)"} data={(this.state.dataDate.length > 0 ? (this.state.showPredictions && this.state.dataPredictionDate.length > 0 ? this.state.dataDate.concat(this.state.dataPredictionDate) : this.state.dataDate) : [])} tooltip={slice => <div><h5>{(slice.id.getMonth()+1).toString()+"/"+(slice.id.getYear()+1900).toString()}</h5>{slice.data.map((e, i) => <p key={i}><span className="dot" style={{backgroundColor: e.serie.color}} />{e.serie.id}: {e.data.y.toFixed(3)}</p>)}</div>} />
            </div>
            <div className="card-body"><h5 className="card-title">Date (Month/Year)</h5></div>
          </div>
          </div>
          <div className="row">
            <div className="chart-card-columns" style={{width: "100%"}}>
              <div className="card">
                <div className="card-img-top" style={{width: "100%", height: "120vh"}}>
                  {this.state.catAllShow ? <Pie ppoCategories={this.state.formCrimeppo} vioCategories={this.state.formCrimevio} locCategories={this.state.formLocgroups} addValue={this.addCategory} dataPpo={this.state.dataCrimePpoAll} dataVio={this.state.dataCrimeVioAll} dataLoc={this.state.dataLocAll} /> : <LoadButton loadData={() => {this.getCityData("catall")}} finishLoading={this.state.catAllDataLoaded} onFinish={() => this.setState({catAllDataLoaded: 0, catAllShow: true})} logoStyle={{width: "200px", height: "200px"}} />}
                </div>
                <div className="card-body">
                  <h5 className="card-title">Categorical Data - All</h5>
                </div>
              </div>
              <div className="card">
                <div className="card-img-top" style={{width: "100%", height: "60vh"}}>
                  {this.state.timeShow ? <Line axisbottom={{"format": d => (d%24< 12 ? ((d+23)%12+1).toString()+' AM' : ((d+23)%12+1).toString()+' PM'), "orient": "bottom", "tickSize": 5, "tickPadding": 5, "tickRotation": 0, "legend": "Hour of Day", "legendOffset": 36, "legendPosition": "middle", "tickValues": [0, 3, 6, 9, 12, 15, 18, 21, 24]}} xscale={{"type": "linear", "min": -1, "max": 25}} yvalue={"Average Crime Count / (1k Population * Year)"} data={this.state.dataTime.length > 0 ? this.state.showPredictions ? this.state.dataTime.concat(this.state.dataPredictionTime) : this.state.dataTime : []} tooltip={slice => <div><h5>{(slice.id%24 < 12 ? ((slice.id+23)%12+1).toString()+' AM' : ((slice.id+23)%12+1).toString()+' PM')}</h5>{slice.data.map((e, i) => <p key={i}><span className="dot" style={{backgroundColor: e.serie.color}} />{e.serie.id}: {e.data.y.toFixed(3)}</p>)}</div>} /> : <LoadButton loadData={() => {this.getCityData("timeall"); if (this.state.blockid !== "") {this.getCityData("time")}}} finishLoading={this.state.timeDataLoaded === 0} onFinish={() => this.setState({timeDataLoaded: 0, timeShow: true})} logoStyle={{width: "200px", height: "200px"}} />}
                </div>
                <div className="card-body">
                  <h5 className="card-title">Hour of the Day</h5>
                </div>
              </div>
              <div className="card">
                <div className="card-img-top" style={{width: "100%", height: "60vh"}}>
                  {this.state.dowShow ? <Line axisbottom={{"format": d => dow[d%7], "orient": "bottom", "tickSize": 5, "tickPadding": 5, "tickRotation": 0, "legend": "Day of Week", "legendOffset": 36, "legendPosition": "middle", "tickValues": [0,1,2,3,4,5,6]}} xscale={{"type": "linear", "min": -1, "max": 7}} yvalue={"Average Crime Count / (1k Population * Year)"} data={this.state.dataDOTW.length > 0 ? this.state.showPredictions ? this.state.dataDOTW.concat(this.state.dataPredictionDOW) : this.state.dataDOTW : []} tooltip={slice => <div><h5>{dow[(slice.id+7)%7]}</h5>{slice.data.map((e, i) => <p key={i}><span className="dot" style={{backgroundColor: e.serie.color}} />{e.serie.id}: {e.data.y.toFixed(3)}</p>)}</div>} /> : <LoadButton loadData={() => {this.getCityData("dowall"); if (this.state.blockid !== "") {this.getCityData("dow")}}} finishLoading={this.state.dowDataLoaded === 0} onFinish={() => this.setState({dowDataLoaded: 0, dowShow: true})} logoStyle={{width: "200px", height: "200px"}} />}
                </div>
                <div className="card-body">
                  <h5 className="card-title">Day of the Week</h5>
                </div>
              </div>
              {this.state.blockid !== "" ?
                <div className="card">
                  <div className="card-img-top" style={{width: "100%", height: "120vh"}}>
                    {this.state.catBlockShow ? <Pie ppoCategories={this.state.formCrimeppo} vioCategories={this.state.formCrimevio} locCategories={this.state.formLocgroups} addValue={this.addCategory} dataPpo={this.state.dataCrimePpoBlock} dataVio={this.state.dataCrimeVioBlock} dataLoc={this.state.dataLocBlock} /> : <LoadButton loadData={() => {this.getCityData("cat")}} finishLoading={this.state.catBlockDataLoaded} onFinish={() => this.setState({catBlockDataLoaded: 0, catBlockShow: true})} logoStyle={{width: "200px", height: "200px"}} />}
                  </div>
                  <div className="card-body">
                    <h5 className="card-title">{"Categorical Data - "+this.state.blockid}</h5>
                  </div>
                </div> :
              null}
            </div>
          </div>
        </div>
      </div>
    );
  }
}