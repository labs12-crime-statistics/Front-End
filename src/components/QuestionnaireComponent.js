import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import axios from 'axios';
import Search from './PlacesSearchBarComponent';
import LoadingLogo from './LoadingLogoComponent';

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

export default class QuestionnaireComponent extends Component {
  constructor(props) {
    super(props);
    this.state = {
      questLevel: 0,
      profile: 0,
      cityid: 1,
      blockid: 1,
      months: [0,1,2,3,4,5,6,7,8,9,10,11],
      dow: [0,1,2,3,4,5,6],
      time: [0,1,2,3],
      crimevio: [0,1],
      crimeppo: [0,1,2],
      crimeloc: [0,1,2,3,4],
      submit: false,
      redirect: false,
      params: "",
      loaded: false,
      finishLoading: false
    }

    this.loadedMaps = this.loadedMaps.bind(this);
    this.getCities = this.getCities.bind(this);
    this.selectPlace = this.selectPlace.bind(this);
    this.getTipJob = this.getTipJob.bind(this);
    this.getTips = this.getTips.bind(this);

    this.messagesEnd = React.createRef();
  }

  componentDidMount() {
    loadGoogleMaps(this.loadedMaps);
    this.setState({submit: false, redirect: false});
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
      });
    });
  }

  selectPlace(loc) {
    new Promise(resolve => axios({
      url: be_url+"/city/"+this.state.cityid.toString()+"/location",
      method: 'GET',
      params: loc
    }).then(response => {
      resolve(response.data);
    })).then(result => {
      if (result.error !== "NO_BLOCK") {
        this.setState({
          blockid: parseInt(result.blockid)
        });
      }
    });
  }

  createParams() {
    const crimeviodict = {
      0: "VIOLENT",
      1: "NON_VIOLENT"
    };
    const crimeppodict = {
      0: "PERSONAL",
      1: "PROPERTY",
      2: "OTHER"
    };
    const crimelocdict = {
      0: "STREET",
      1: "RESIDENTIAL",
      2: "COMMERCIAL",
      3: "PERSONAL_VEHICLE",
      4: "OTHER"
    };
    var params = [];
    if (this.state.cityid) {params.push("cityid="+this.state.cityid.toString())}
    if (this.state.blockid) {params.push("blockid="+this.state.blockid.toString())}
    if (this.state.dow) {params.push("dotw="+this.state.dow.map(x => x.toString()).join(","))}
    // if (this.state.crimevio) {params.push("crimevio="+this.state.crimevio.map(x => crimeviodict[x]).join(","))}
    // if (this.state.crimeppo) {params.push("crimeppo="+this.state.crimeppo.map(x => crimeppodict[x]).join(","))}
    // if (this.state.crimeloc) {params.push("crimeloc="+this.state.crimeloc.map(x => crimelocdict[x]).join(","))}
    return(params.length > 0 ? "?"+params.join("&") : "")
  }

  getTips() {
    var request = {url: be_url+"/tips", params: {cityid: this.state.cityid.toString(), blockid: this.state.blockid.toString()}, method: "GET"};
    this.getTipJob(request);
  }

  getTipJob(request) {
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
        this.getTipJob(result.data);
      } else {
        var dow = [];
        for (var i=0; i<result.data.diffDow.length; i++) {
          if (this.state.dow.indexOf(i) !== -1) {
            dow.push({id: i, type: "dow", value: result.data.diffDow[i]})
          }
        }
        dow.sort((a,b) => {return(a.value - b.value)}).reverse();
        var time = [];
        for (i=0; i<result.data.diffHour.length; i++) {
          if (this.state.time.indexOf(Math.floor(i/6)) !== -1) {
            time.push({id: i, type: "hour", value: result.data.diffHour[i]})
          }
        }
        time.sort((a,b) => {return(a.value - b.value)}).reverse();
        var month = [];
        for (i=0; i<result.data.diffMonth.length; i++) {
          if (this.state.months.indexOf(i) !== -1) {
            month.push({id: i, type: "month", value: result.data.diffMonth[i]})
          }
        }
        month.sort((a,b) => {return(a.value - b.value)}).reverse();
        this.setState((prevState) => ({
          changeFuture: result.data.changeFuture,
          changePast: result.data.changePast,
          cityComp: result.data.cityComp,
          dataDow: dow.slice(0,3),
          dataTime: time.slice(0,3),
          dataMonth: month.slice(0,3),
          finishLoading: true
        }));
      }
    });
  }

  render() {
    const monthDict = {
      0: "January",
      1: "February",
      2: "March",
      3: "April",
      4: "May",
      5: "June",
      6: "July",
      7: "August",
      8: "September",
      9: "October",
      10: "November",
      11: "December"
    }
    const dowDict = {
      0: "Monday",
      1: "Tuesday",
      2: "Wednesday",
      3: "Thursday",
      4: "Friday",
      5: "Saturday",
      6: "Sunday"
    }
    const valToString = (d) => {
      if (d.type === "month") {
        return(monthDict[d.id]);
      } else if (d.type === "dow") {
        return(dowDict[d.id]);
      } else if (d.type === "hour") {
        var hour = d.id%12;
        var m = " AM";
        if (hour === 0) {hour = 12}
        if (d.id > 11) {m = " PM"};
        return(hour+m);
      }
    }
    const MapButton = withRouter(({ history }) => (
      <button type="button" className="btn btn-primary" style={{marginLeft: "20px", marginRight: "20px"}} onClick={() => {history.push('/map'+this.createParams())}}><h4 style={{marginBottom: "0px"}}>Show My Map</h4></button>
    ));
    const tips = <div className="row">
      <div className="col-10 offset-1">
        {this.state.loaded ?
          <div>
            <div>
              <h1 className="display-6">
                Average Yearly Change of Crime Rate of Block over Past 5 Years
              </h1>
              <p style={{marginLeft: "30px"}}>{(Math.abs(this.state.changePast) * 100.0).toFixed(2)} % {this.state.changePast < 0 ? "Decrease in Crime" : "Increase in Crime"}</p>
              <h1 className="display-6">
                Predicted Change of Crime Rate of Block
              </h1>
              <p style={{marginLeft: "30px"}}>{(Math.abs(this.state.changeFuture) * 100.0).toFixed(2)} % {this.state.changeFuture < 0 ? "Decrease in Crime" : "Increase in Crime"}</p>
              <h1 className="display-6">
                Current Safety of Block compared to City
              </h1>
              <p style={{marginLeft: "30px"}}>{this.state.cityComp < -1.5 ? "Much More Safe" : this.state.cityComp < -0.5 ? "More Safe" : this.state.cityComp < 0.5 ? "About the Same" : this.state.cityComp < 1.5 ? "More Unsafe" : "Much More Unsafe"}</p>
              <h1 className="display-6">
                Suggested Hours to Avoid this Block
              </h1>
              <ul>
                {this.state.dataTime.map(x => <li style={{marginLeft: "30px"}}>{valToString(x)}</li>)}
              </ul>
              <h1 className="display-6">
                Suggested Days of the Week to Take Precaution in this Block
              </h1>
              <ul>
                {this.state.dataDow.map(x => <li style={{marginLeft: "30px"}}>{valToString(x)}</li>)}
              </ul>
              <h1 className="display-6">
              Suggested Months of the Week to Take Precaution in this Block
              </h1>
              <ul>
                {this.state.dataMonth.map(x => <li style={{marginLeft: "30px"}}>{valToString(x)}</li>)}
              </ul>
            </div>
            <div>
              <MapButton />
              <button className="btn btn-primary" style={{marginLeft: "20px", marginRight: "20px"}} onClick={() => {this.setState({submit: false, loaded: false, finishLoading: false})}}><h4 style={{marginBottom: "0px"}}>Back</h4></button>
            </div>
          </div>
          : <div className="row-nomarg align-items-center text-center" style={{height: "60vh", width: "100%"}}>
            <div className="col-12"><LoadingLogo finish={this.state.finishLoading} endLoading={() => {this.setState({loaded: true})}} style={{width: "200px", height: "200px"}} /></div>
          </div>}
      </div>
    </div>;
    const questionnaire = <div className="row">
      <div className="col-10 offset-1">
        <div className="row">
          <div className="col-12">
            <div className={"row title-row"+(this.state.questLevel >= 0 ? " title-row-active" : "")}>
              <h1 className="display-6">
                I am a...
              </h1>
              <div className={"container body-row"+(this.state.questLevel >= 0 ? " body-row-active" : "")}>
                <button style={{height: "40px", borderRadius: "20px", margin: "20px"}} className={"btn "+(this.state.profile === 0 ? "btn-primary" : "btn-outline-primary")} onClick={() => {
                  this.setState({
                    profile: 0,
                    months: [0,1,2,3,4,5,6,7,8,9,10,11],
                    dow: [0,1,2,3,4,5,6],
                    time: [0,1,2,3],
                    crimevio: [0,1],
                    crimeppo: [0,1,2],
                    crimeloc: [0,1,2,3,4]
                  })
                }}><h4>Resident</h4></button>
                <button style={{height: "40px", borderRadius: "20px", margin: "20px"}} className={"btn "+(this.state.profile === 1 ? "btn-primary" : "btn-outline-primary")} onClick={() => {
                  this.setState({
                    profile: 1,
                    months: [4,5,6,7,8],
                    dow: [4,5,6],
                    time: [2,3],
                    crimevio: [0,1],
                    crimeppo: [0],
                    crimeloc: [0]
                  })
                }}><h4>Tourist</h4></button>
              </div>
            </div>
          </div>
        </div>
        {this.state.questLevel >= 1 ?
        <div className="row">
          <div className="col-12">
            <div className={"row title-row"+(this.state.questLevel >= 1 ? " title-row-active" : "")}>
              <h1 className="display-6">
              I am looking around...
              </h1>
            </div>
            <div className={"row-nomarg body-row"+(this.state.questLevel >= 1 ? " body-row-active" : "")}>
              <div className="col-12">
                <Search google={this.state.google} city={this.state.city} cities={this.state.cities} selectPlace={this.selectPlace} selectCity={(c) => {this.setState({cityid: parseInt(c)})}} />
              </div>
              <div className="col-12"><p>City ID: {this.state.cityid}</p></div>
              <div className="col-12"><p>Block ID: {this.state.blockid}</p></div>
            </div>
          </div>
        </div>
        : null}
        {this.state.questLevel >= 2 ?
        <div className="row">
          <div className="col-12">
            <div className={"row title-row"+(this.state.questLevel >= 2 ? " title-row-active" : "")}>
              <h1 className="display-6">
                I will be there in the months of...
              </h1>
            </div>
            <div className={"row body-row"+(this.state.questLevel >= 2 ? " body-row-active" : "")}>
              <button style={{height: "40px", borderRadius: "20px", margin: "20px"}} className={"btn "+(this.state.months.indexOf(0) !== -1 ? "btn-primary" : "btn-outline-primary")} onClick={() => {this.setState((prevState) => ({months: (prevState.months.indexOf(0) === -1 ? prevState.months.concat([0]) : prevState.months.filter(x => x !== 0))}))}}><h4>January</h4></button>
              <button style={{height: "40px", borderRadius: "20px", margin: "20px"}} className={"btn "+(this.state.months.indexOf(1) !== -1 ? "btn-primary" : "btn-outline-primary")} onClick={() => {this.setState((prevState) => ({months: (prevState.months.indexOf(1) === -1 ? prevState.months.concat([1]) : prevState.months.filter(x => x !== 1))}))}}><h4>February</h4></button>
              <button style={{height: "40px", borderRadius: "20px", margin: "20px"}} className={"btn "+(this.state.months.indexOf(2) !== -1 ? "btn-primary" : "btn-outline-primary")} onClick={() => {this.setState((prevState) => ({months: (prevState.months.indexOf(2) === -1 ? prevState.months.concat([2]) : prevState.months.filter(x => x !== 2))}))}}><h4>March</h4></button>
              <button style={{height: "40px", borderRadius: "20px", margin: "20px"}} className={"btn "+(this.state.months.indexOf(3) !== -1 ? "btn-primary" : "btn-outline-primary")} onClick={() => {this.setState((prevState) => ({months: (prevState.months.indexOf(3) === -1 ? prevState.months.concat([3]) : prevState.months.filter(x => x !== 3))}))}}><h4>April</h4></button>
              <button style={{height: "40px", borderRadius: "20px", margin: "20px"}} className={"btn "+(this.state.months.indexOf(4) !== -1 ? "btn-primary" : "btn-outline-primary")} onClick={() => {this.setState((prevState) => ({months: (prevState.months.indexOf(4) === -1 ? prevState.months.concat([4]) : prevState.months.filter(x => x !== 4))}))}}><h4>May</h4></button>
              <button style={{height: "40px", borderRadius: "20px", margin: "20px"}} className={"btn "+(this.state.months.indexOf(5) !== -1 ? "btn-primary" : "btn-outline-primary")} onClick={() => {this.setState((prevState) => ({months: (prevState.months.indexOf(5) === -1 ? prevState.months.concat([5]) : prevState.months.filter(x => x !== 5))}))}}><h4>June</h4></button>
              <button style={{height: "40px", borderRadius: "20px", margin: "20px"}} className={"btn "+(this.state.months.indexOf(6) !== -1 ? "btn-primary" : "btn-outline-primary")} onClick={() => {this.setState((prevState) => ({months: (prevState.months.indexOf(6) === -1 ? prevState.months.concat([6]) : prevState.months.filter(x => x !== 6))}))}}><h4>July</h4></button>
              <button style={{height: "40px", borderRadius: "20px", margin: "20px"}} className={"btn "+(this.state.months.indexOf(7) !== -1 ? "btn-primary" : "btn-outline-primary")} onClick={() => {this.setState((prevState) => ({months: (prevState.months.indexOf(7) === -1 ? prevState.months.concat([7]) : prevState.months.filter(x => x !== 7))}))}}><h4>August</h4></button>
              <button style={{height: "40px", borderRadius: "20px", margin: "20px"}} className={"btn "+(this.state.months.indexOf(8) !== -1 ? "btn-primary" : "btn-outline-primary")} onClick={() => {this.setState((prevState) => ({months: (prevState.months.indexOf(8) === -1 ? prevState.months.concat([8]) : prevState.months.filter(x => x !== 8))}))}}><h4>September</h4></button>
              <button style={{height: "40px", borderRadius: "20px", margin: "20px"}} className={"btn "+(this.state.months.indexOf(9) !== -1 ? "btn-primary" : "btn-outline-primary")} onClick={() => {this.setState((prevState) => ({months: (prevState.months.indexOf(9) === -1 ? prevState.months.concat([9]) : prevState.months.filter(x => x !== 9))}))}}><h4>October</h4></button>
              <button style={{height: "40px", borderRadius: "20px", margin: "20px"}} className={"btn "+(this.state.months.indexOf(10) !== -1 ? "btn-primary" : "btn-outline-primary")} onClick={() => {this.setState((prevState) => ({months: (prevState.months.indexOf(10) === -1 ? prevState.months.concat([10]) : prevState.months.filter(x => x !== 10))}))}}><h4>November</h4></button>
              <button style={{height: "40px", borderRadius: "20px", margin: "20px"}} className={"btn "+(this.state.months.indexOf(11) !== -1 ? "btn-primary" : "btn-outline-primary")} onClick={() => {this.setState((prevState) => ({months: (prevState.months.indexOf(11) === -1 ? prevState.months.concat([11]) : prevState.months.filter(x => x !== 11))}))}}><h4>December</h4></button>
            </div>
          </div>
        </div>
        : null}
        {this.state.questLevel >= 3 ?
        <div className="row">
          <div className="col-12">
            <div className={"row title-row"+(this.state.questLevel >= 3 ? " title-row-active" : "")}>
              <h1 className="display-6">
                I will be there on the days...
              </h1>
            </div>
            <div className={"row body-row"+(this.state.questLevel >= 3 ? " body-row-active" : "")}>
              <button className={"btn "+(this.state.dow.indexOf(0) !== -1 ? "btn-primary" : "btn-outline-primary")} style={{height: "50px", width: "50px", borderRadius: "50%", margin: "20px"}} onClick={() => {this.setState((prevState) => ({dow: (prevState.dow.indexOf(0) === -1 ? prevState.dow.concat([0]) : prevState.dow.filter(x => x !== 0))}))}}>M</button>
              <button className={"btn "+(this.state.dow.indexOf(1) !== -1 ? "btn-primary" : "btn-outline-primary")} style={{height: "50px", width: "50px", borderRadius: "50%", margin: "20px"}} onClick={() => {this.setState((prevState) => ({dow: (prevState.dow.indexOf(1) === -1 ? prevState.dow.concat([1]) : prevState.dow.filter(x => x !== 1))}))}}>Tu</button>
              <button className={"btn "+(this.state.dow.indexOf(2) !== -1 ? "btn-primary" : "btn-outline-primary")} style={{height: "50px", width: "50px", borderRadius: "50%", margin: "20px"}} onClick={() => {this.setState((prevState) => ({dow: (prevState.dow.indexOf(2) === -1 ? prevState.dow.concat([2]) : prevState.dow.filter(x => x !== 2))}))}}>W</button>
              <button className={"btn "+(this.state.dow.indexOf(3) !== -1 ? "btn-primary" : "btn-outline-primary")} style={{height: "50px", width: "50px", borderRadius: "50%", margin: "20px"}} onClick={() => {this.setState((prevState) => ({dow: (prevState.dow.indexOf(3) === -1 ? prevState.dow.concat([3]) : prevState.dow.filter(x => x !== 3))}))}}>Th</button>
              <button className={"btn "+(this.state.dow.indexOf(4) !== -1 ? "btn-primary" : "btn-outline-primary")} style={{height: "50px", width: "50px", borderRadius: "50%", margin: "20px"}} onClick={() => {this.setState((prevState) => ({dow: (prevState.dow.indexOf(4) === -1 ? prevState.dow.concat([4]) : prevState.dow.filter(x => x !== 4))}))}}>F</button>
              <button className={"btn "+(this.state.dow.indexOf(5) !== -1 ? "btn-primary" : "btn-outline-primary")} style={{height: "50px", width: "50px", borderRadius: "50%", margin: "20px"}} onClick={() => {this.setState((prevState) => ({dow: (prevState.dow.indexOf(5) === -1 ? prevState.dow.concat([5]) : prevState.dow.filter(x => x !== 5))}))}}>Sa</button>
              <button className={"btn "+(this.state.dow.indexOf(6) !== -1 ? "btn-primary" : "btn-outline-primary")} style={{height: "50px", width: "50px", borderRadius: "50%", margin: "20px"}} onClick={() => {this.setState((prevState) => ({dow: (prevState.dow.indexOf(6) === -1 ? prevState.dow.concat([6]) : prevState.dow.filter(x => x !== 6))}))}}>Su</button>
            </div>
          </div>
        </div>
        : null}
        {this.state.questLevel >= 4 ?
        <div className="row">
          <div className="col-12">
            <div className={"row title-row"+(this.state.questLevel >= 4 ? " title-row-active" : "")}>
              <h1 className="display-6">
                I will be active in the...
              </h1>
            </div>
            <div className={"row body-row"+(this.state.questLevel >= 4 ? " body-row-active" : "")}>
              <button style={{height: "100px", borderRadius: "20px", margin: "20px"}} className={"btn "+(this.state.time.indexOf(0) !== -1 ? "btn-primary" : "btn-outline-primary")} onClick={() => {this.setState((prevState) => ({time: (prevState.time.indexOf(0) === -1 ? prevState.time.concat([0]) : prevState.time.filter(x => x !== 0))}))}}><h4>Night</h4><br /><p>12 AM - 6 AM</p></button>
              <button style={{height: "100px", borderRadius: "20px", margin: "20px"}} className={"btn "+(this.state.time.indexOf(1) !== -1 ? "btn-primary" : "btn-outline-primary")} onClick={() => {this.setState((prevState) => ({time: (prevState.time.indexOf(1) === -1 ? prevState.time.concat([1]) : prevState.time.filter(x => x !== 1))}))}}><h4>Morning</h4><br /><p>6 AM - 12 PM</p></button>
              <button style={{height: "100px", borderRadius: "20px", margin: "20px"}} className={"btn "+(this.state.time.indexOf(2) !== -1 ? "btn-primary" : "btn-outline-primary")} onClick={() => {this.setState((prevState) => ({time: (prevState.time.indexOf(2) === -1 ? prevState.time.concat([2]) : prevState.time.filter(x => x !== 2))}))}}><h4>Afternoon</h4><br /><p>12 PM - 6 PM</p></button>
              <button style={{height: "100px", borderRadius: "20px", margin: "20px"}} className={"btn "+(this.state.time.indexOf(3) !== -1 ? "btn-primary" : "btn-outline-primary")} onClick={() => {this.setState((prevState) => ({time: (prevState.time.indexOf(3) === -1 ? prevState.time.concat([3]) : prevState.time.filter(x => x !== 3))}))}}><h4>Evening</h4><br /><p>6 PM - 12 AM</p></button>
            </div>
          </div>
        </div>
        : null}
        {/* {this.state.questLevel >= 5 ?
        <div className="row">
          <div className="col-12">
            <div className={"row title-row"+(this.state.questLevel >= 5 ? " title-row-active" : "")}>
              <h1 className="display-6">
                I am interested in crime categories of...
              </h1>
            </div>
            <div className={"row body-row"+(this.state.questLevel >= 5 ? " body-row-active" : "")}>
              <button style={{height: "40px", borderRadius: "20px", margin: "20px"}} className={"btn "+(this.state.crimevio.indexOf(0) !== -1 ? "btn-primary" : "btn-outline-primary")} onClick={() => {this.setState((prevState) => ({crimevio: (prevState.crimevio.indexOf(0) === -1 ? prevState.crimevio.concat([0]) : prevState.crimevio.filter(x => x !== 0))}))}}><h4>Violent</h4></button>
              <button style={{height: "40px", borderRadius: "20px", margin: "20px"}} className={"btn "+(this.state.crimevio.indexOf(1) !== -1 ? "btn-primary" : "btn-outline-primary")} onClick={() => {this.setState((prevState) => ({crimevio: (prevState.crimevio.indexOf(1) === -1 ? prevState.crimevio.concat([1]) : prevState.crimevio.filter(x => x !== 1))}))}}><h4>Non Violent</h4></button>
            </div>
          </div>
        </div>
        : null}
        {this.state.questLevel >= 6 ?
        <div className="row">
          <div className="col-12">
            <div className={"row title-row"+(this.state.questLevel >= 6 ? " title-row-active" : "")}>
              <h1 className="display-6">
                I am interested in crime targets of...
              </h1>
            </div>
            <div className={"row body-row"+(this.state.questLevel >= 6 ? " body-row-active" : "")}>
              <button style={{height: "40px", borderRadius: "20px", margin: "20px"}} className={"btn "+(this.state.crimeppo.indexOf(0) !== -1 ? "btn-primary" : "btn-outline-primary")} onClick={() => {this.setState((prevState) => ({crimeppo: (prevState.crimeppo.indexOf(0) === -1 ? prevState.crimeppo.concat([0]) : prevState.crimeppo.filter(x => x !== 0))}))}}><h4>Personal</h4></button>
              <button style={{height: "40px", borderRadius: "20px", margin: "20px"}} className={"btn "+(this.state.crimeppo.indexOf(1) !== -1 ? "btn-primary" : "btn-outline-primary")} onClick={() => {this.setState((prevState) => ({crimeppo: (prevState.crimeppo.indexOf(1) === -1 ? prevState.crimeppo.concat([1]) : prevState.crimeppo.filter(x => x !== 1))}))}}><h4>Property</h4></button>
              <button style={{height: "40px", borderRadius: "20px", margin: "20px"}} className={"btn "+(this.state.crimeppo.indexOf(2) !== -1 ? "btn-primary" : "btn-outline-primary")} onClick={() => {this.setState((prevState) => ({crimeppo: (prevState.crimeppo.indexOf(2) === -1 ? prevState.crimeppo.concat([2]) : prevState.crimeppo.filter(x => x !== 2))}))}}><h4>Other</h4></button>
            </div>
          </div>
        </div>
        : null}
        {this.state.questLevel >= 7 ?
        <div className="row">
          <div className="col-12">
            <div className={"row title-row"+(this.state.questLevel >= 7 ? " title-row-active" : "")}>
              <h1 className="display-6">
                I am interested in crime locations of...
                </h1>
            </div>
            <div className={"row body-row"+(this.state.questLevel >= 7 ? " body-row-active" : "")}>
              <button style={{height: "40px", borderRadius: "20px", margin: "20px"}} className={"btn "+(this.state.crimeloc.indexOf(0) !== -1 ? "btn-primary" : "btn-outline-primary")} onClick={() => {this.setState((prevState) => ({crimeloc: (prevState.crimeloc.indexOf(0) === -1 ? prevState.crimeloc.concat([0]) : prevState.crimeloc.filter(x => x !== 0))}))}}><h4>Street</h4></button>
              <button style={{height: "40px", borderRadius: "20px", margin: "20px"}} className={"btn "+(this.state.crimeloc.indexOf(1) !== -1 ? "btn-primary" : "btn-outline-primary")} onClick={() => {this.setState((prevState) => ({crimeloc: (prevState.crimeloc.indexOf(1) === -1 ? prevState.crimeloc.concat([1]) : prevState.crimeloc.filter(x => x !== 1))}))}}><h4>Commercial</h4></button>
              <button style={{height: "40px", borderRadius: "20px", margin: "20px"}} className={"btn "+(this.state.crimeloc.indexOf(2) !== -1 ? "btn-primary" : "btn-outline-primary")} onClick={() => {this.setState((prevState) => ({crimeloc: (prevState.crimeloc.indexOf(2) === -1 ? prevState.crimeloc.concat([2]) : prevState.crimeloc.filter(x => x !== 2))}))}}><h4>Residential</h4></button>
              <button style={{height: "40px", borderRadius: "20px", margin: "20px"}} className={"btn "+(this.state.crimeloc.indexOf(3) !== -1 ? "btn-primary" : "btn-outline-primary")} onClick={() => {this.setState((prevState) => ({crimeloc: (prevState.crimeloc.indexOf(3) === -1 ? prevState.crimeloc.concat([3]) : prevState.crimeloc.filter(x => x !== 3))}))}}><h4>Personal Vehicle</h4></button>
              <button style={{height: "40px", borderRadius: "20px", margin: "20px"}} className={"btn "+(this.state.crimeloc.indexOf(4) !== -1 ? "btn-primary" : "btn-outline-primary")} onClick={() => {this.setState((prevState) => ({crimeloc: (prevState.crimeloc.indexOf(4) === -1 ? prevState.crimeloc.concat([4]) : prevState.crimeloc.filter(x => x !== 4))}))}}><h4>Other</h4></button>
            </div>
          </div>
        </div>
        : null} */}
        <div className="row"><button ref={(el) => { this.messagesEnd = el; }} className="btn btn-primary" onClick={() => {if (this.state.questLevel === 4) {this.getTips(); this.setState({submit: true})} else {this.setState((prevState) => ({questLevel: prevState.questLevel+1}), () => {this.messagesEnd.scrollIntoView({ behavior: "smooth" })})}}}><h4 style={{margin: "0px"}}>{this.state.questLevel < 4 ? "Next" : "Get My Tips"}</h4></button></div>
      </div>
    </div>;
    return(
      <div className="row">
        <div className="col-12">
          <div className="row">
            <div className="col-10">
              <h3 className="display-3">Let's Get Started</h3>
            </div>
          </div>
          {this.state.submit ? tips : questionnaire}
        </div>
      </div>
    )
  }
}