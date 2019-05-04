<template>
  <div id="app">
    <div class="parent">
      <div class="row">
        <div class="col-4">
          <div class=" driver-entry" v-for="(driver, driver_key) in getDrivers()" v-bind:key="driver_key">
            <div class="col-8">
              <div class="box top-box row col-6">
                <span class="first-name">{{ driver.FirstName }} </span>
                <span class="last-name">{{ driver.LastName }}</span>
              </div>
              <div class="box subtext-box row col-6">
                <span v-if="session.GamePhase == 'GreenFlag'">
                  <span v-if="driver.PitState !== 'None'">
                   Pit
                  </span>
                  <span v-else>
                    <span v-if="driver.Status === 'None'">
                      <span v-if="session.IsRace">
                        {{ driver.LapsBehind == 0 ? (driver.Position !== 1 ? driver.TimeBehindString : "Lap " + (driver.Laps +1)) : driver.LapsBehind}}
                      </span>
                      <span v-else>
                        <span v-if="driver.BestLapString !== '00:01:000'">
                          {{ driver.BestLapString }}
                        </span>
                        <span v-else>
                          No time set
                        </span>
                      </span>
                    </span>
                    <span v-else>
                      {{ driver.Status }}
                    </span>
                  </span>
                </span>
                
                <span v-else>
                  {{ driver.VehicleName }}
                </span>
              </div>
              <div class="box position-box">
                {{ driver.Position }}
              </div>
            </div>
          </div>
        </div>
        <div class="col-4">
          <div class="row">
            <div class="col-4"></div>
            <div class="session-left col-4">
              {{ session.GamePhase != "GreenFlag" ? session.GamePhase : leftDisplayString }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="box box-invert logo-box">
      <img :src="logo" />
    </div>
    
    <div class="race-control-banner animated" v-bind:class="{'flipInX': lastBannerDisplay != null && bannerDisplayName === 'race-control'}" v-if="lastBannerDisplay != null && bannerDisplayName === 'race-control'" >
      <div class="race-control-header">Race Control</div>
      <div class="race-control-content">
        
        {{ typeof sessionNames[lastGamePhase] !== 'undefined' ? sessionNames[lastGamePhase]  : lastGamePhase }}
      </div>
    </div>
    <div class="sponsor-banner" v-if="lastBannerDisplay != null && lastSponsor !== null && session.GamePhase == 'GreenFlag'" >
      <div v-if="lastSponsor !== null">
        <div class="sponsor-header">Sponsor: {{ lastSponsor.name }}</div>
        <div class="sponsor-content">
          <img :src="lastSponsor.logo">
        </div>
      </div>
    </div>
    <div class="sector-info" v-if="yellowSector.filter((s) => {return s}).length > 0">
      <div  v-for="(sector, sector_key) in yellowSector" :key="sector_key">
        <div v-if="sector === true" class="box yellow-flag">S{{ sector_key +1}}</div> 
      </div>
    </div>
  </div>
</template>

<script>
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'animate.css/animate.min.css'
import store from "./store";
import config from "../config"
const url = require('url');
export default {
  store,
  name: "app",
  data() {
    return {
      logo: config.logourl,
      intervalId: null,
      bannerIntervalId: null,
      lastBannerDisplay: null,
      lastGamePhase: null,
      bannerTimeout: 6,
      bannerDisplayName: null,
      lastSponsor: null,
      lastSponsorIndex: 0,
      sponsors: [
        {
          "name": "Coldfox Arts",
          "logo": "https://coldfox.de/wp-content/uploads/2017/10/Logo_header.png"
        }
      ],
      maxTime: null,
      currentTreePage: 1,
      sessionNames: {
        "GridWalk": "Grid walk in progress",
        "Countdown": "Race countdown running",
        "GreenFlag": "Session is open",
        "SessionOver": "Session finished"
      }
    };
  },
  beforeDestroy(){
    clearInterval(this.intervalId)
    clearInterval(this.bannerIntervalId)
  },
  created() {
    var urlParams = url.parse(window.location.href, true)
    if (typeof urlParams.query.maxTime !== 'undefined') {
      this.maxTime = urlParams.query.maxTime
    }
    const _t = this
    this.intervalId = setInterval(function() {
      _t.$store.dispatch("getInfos")
      if (_t.$store.state.session.infos === null || typeof _t.$store.state.session.infos.Session === 'undefined'){
        return
      }
      if (_t.$store.state.session.infos.Session.GamePhase !== _t.lastGamePhase) {
        _t.lastGamePhase = _t.$store.state.session.infos.Session.GamePhase
        _t.lastBannerDisplay = _t.unixTimestamp()
        _t.bannerDisplayName = 'race-control'
      }

      if (_t.unixTimestamp() >= _t.lastBannerDisplay + _t.bannerTimeout){
        _t.lastBannerDisplay = null
        _t.bannerDisplayName = null
        _t.lastSponsor = null
      } 
    },1000)
    this.bannerIntervalId = setInterval(function() {
      _t.$store.dispatch("getInfos")
      if (_t.lastSponsor === null && typeof _t.sponsors[_t.lastSponsorIndex] !== 'undefined'){
        _t.lastSponsor = _t.sponsors[_t.lastSponsorIndex]
        _t.lastBannerDisplay = _t.unixTimestamp()
        _t.bannerDisplayName = null
      }
      if (_t.lastSponsorIndex < _t.sponsors.length){
        _t.lastSponsorIndex++
      } else {
        _t.lastSponsorIndex = 0
      }
      _t.currentTreePage++
      if (_t.getDrivers().length === 0){
        _t.currentTreePage = 1
      }
    },13000)
  },
  methods: {
    round(value){
      return  Math.round(value * 1000) / 1000
    },
    unixTimestamp(){
      return Math.round(+new Date()/1000)
    },
    getDrivers() {
      var drivers  = []
      try {
        if (this.$store.state.session.infos !== null){
          drivers = JSON.parse(JSON.stringify(this.$store.state.session.infos.Drivers))
          drivers.sort(function(a,b) {return a.Position > b.Position ? 1 : -1}) 
        }
      } catch (e) {
        // eslint-disable-next-line
        console.log(e)
      }

      if (drivers.length <= 20){
        return drivers
      } else {
        var result = drivers.slice((this.currentTreePage -1)*20, this.currentTreePage*20)
        return result
      }
    }
  },
  computed: {
    session(){
      return this.$store.state.session.infos.Session
    },
    leftDisplayString() {
      if (typeof this.$store.state.session.infos.Session !== 'undefined'){
        if (this.maxTime !== null){
          return this.$store.state.session.infos.Session.SessionLeftString +  "/ " + this.maxTime
        }
        return this.$store.state.session.infos.Session.SessionLeftString
      }
      return ""
    },
    yellowSector() {
      if (typeof this.$store.state.session.infos.Session !== 'undefined'){
        return this.$store.state.session.infos.Session["YellowFlags"]
      }
      return []
    }
  }
};
</script>

<style>
@import url('https://fonts.googleapis.com/css?family=Ubuntu');
@import url('https://fonts.googleapis.com/css?family=Quicksand');
body{
  background: rgba(0, 93, 255, 0.02);
}
.box {
	margin-right:2px;
	padding:1em 2.5em;
	display: block;
	position: relative;
	text-decoration: none;
}

.box::after {
	content:'';
	position: absolute;
	top:0;
	left:0;
	right: 0;
	bottom: 0;
	z-index:-1;
	transform:skew(-30deg);
}

.box-invert::after {
	content:'';
	position: absolute;
	top:0;
	left:0;
	right: 0;
	bottom: 0;
	z-index:-1;
	transform:skew(20deg);
}
.top-box {
  left: -5px !important;
  color: white;
  padding: 0.2em 1em !important;
  font-size: 9pt; 
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  box-shadow: 0px 0px 2px rgba(0,0,0,.8);
}
.position-box {
  color: #343839;
  position: relative;
  top: -3em;
  width: 2em;
  height: 2em;
  left: 9.6em;
  z-index: 1000;
  text-align: center;
  padding: unset;
  padding-top: 0.2em;
  font-weight: bold;
}
.subtext-box {
  left: -20px !important;
  color: #343839;
  padding: 0.1em 2em !important;
  font-size: 9pt;
  font-family: 'Quicksand', sans-serif;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.logo-box {
  color: white;
  position: fixed;
  top: 0em;
  right: -3em;
  height: 8em;
  width: 270px;
}
.logo-box img {
  height: 100%;
}

.yellow-flag{
  padding: 0.5em;
  font-weight: bold;
  text-transform: uppercase;
  margin-bottom: 0.5em;
}
.top-box::after {
  background: #343839;
  -webkit-transform: unset;
  transform: unset;
}
.position-box::after {
  background: #ffc600;
}

.subtext-box::after {
  background: white;
}
.yellow-flag::after {
  background: #ffc600;
}
.driver-entry {
  height: 2.8em;
  margin-bottom: 0.5em;
}

.parent {
  margin-top: 1em;
}
.session-left {
  background: #343839;
  color: white;
  text-align: center;
  padding: 0.5em;
  border-radius: 0.2em;
  font-family: 'Quicksand', sans-serif;
  letter-spacing: 2px;
  font-weight: bold;
}

.sector-info{
  position: fixed;
  right: 1em;
  top: 20%;
  font-size: 15pt;
}
.sector{
  font-weight: bold;
  padding-left: 0.4em;
}
.race-control-banner {
  position: absolute;
  right: 1em;
  bottom: 1em;
  width: 250px;
  background: #343839;
  color: white;
}
.race-control-header {
  padding: 0.5em;
}
.race-control-content {
  background: white;  
  color: #343839;
  padding: 0.5em;
}
.sponsor-banner {
  position: absolute;
  width: 200px;
  height: 200px;
  right: 1em;
  top: 30em;
}
.sponsor-banner {
  position: absolute;
  right: 1em;
  bottom: 1em;
  width: 250px;
}
.sponsor-header {
  background: #343839;
  color: white;
  padding: 0.5em;
}
.sponsor-content {
  margin-top: 1em;
  text-align: left;
}
.sponsor-content img {
  width: 100%;
}
.sesion-left {
  font-family: 'Quicksand', sans-serif;
}
.last-name {
  font-weight: bold;
  text-transform: uppercase;
}
body {
  font-family: 'Ubuntu', sans-serif;;  
  -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Safari */
     -khtml-user-select: none; /* Konqueror HTML */
       -moz-user-select: none; /* Firefox */
        -ms-user-select: none; /* Internet Explorer/Edge */
            user-select: none; /* Non-prefixed version, currently
                                  supported by Chrome and Opera */
}
.logo {
  position: fixed;
  top: 1em;
  right: 1em;
  width: 7%;
}
</style>
