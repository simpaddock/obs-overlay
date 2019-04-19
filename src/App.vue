<template>
  <div id="app">
    <div class="parent">
      <div class="row">
        <div class="col-2">
          <div class="row driver-entry" v-for="(driver, driver_key) in drivers" v-bind:key="driver_key">
            <div class="col-8">
              <div class="box top-box row col-12">
                {{ driver.LastName }}, {{ driver.FirstName[0] }}. 
              </div>
              <div class="box subtext-box row col-9">
                <span v-if="driver.PitState !== 'None'">
                 {{ driver.PitState }}
                </span>
                <span v-else>
                  <span v-if="driver.Status === 'None'">
                    <span v-if="session.IsRace">
                      {{ driver.LapsBehind == 0 ? (driver.Position !== 1 ? driver.TimeBehindString : "Lap " + (driver.Laps +1)) : driver.LapsBehind }}
                    </span>
                    <span v-else>
                      <span v-if="driver.BestLapString !== '00:01:000'">
                        {{ driver.BestLapString }}
                      </span>
                      <span v-else>
                        No time
                      </span>
                    </span>
                  </span>
                <span v-else>
                  {{ driver.Status }}
                </span>
                </span>

              </div>
              <div class="box position-box">
                {{ driver.Position }}
              </div>
            </div>
          </div>
        </div>
        <div class="col-2"></div>
        <div class="col-4">
          <div class="row">
            <div class="col-4"></div>
            <div class="session-left col-4">
              {{ leftDisplayString }}
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="box box-invert logo-box">
      <img :src="logo" />
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
import store from "./store";
import config from "../config"
export default {
  store,
  name: "app",
  data() {
    return {
      logo: config.logourl,
      intervalId: null
    };
  },
  beforeDestroy(){
    clearInterval(this.intervalId)
  },
  created() {
    const _t = this
    _t.isInDirectorMode = window.location.pathname.indexOf("/advanced") !== -1
    this.intervalId = setInterval(function() {
      if (_t.$store.state.session.pending.infos === true){
        return
      }
      _t.$store.dispatch("getInfos")
      _t.lastControlSet = JSON.parse(_t.$store.state.session.infos.RaceOverlayControlSet)

      if (_t.lastCommandId != parseInt(_t.$store.state.session.infos.CommandId)){
        _t.lastSlotId =  _t.$store.state.session.infos.SlotId
        _t.lastCameraId = _t.$store.state.session.infos.CameraId;
        _t.lastBannerDisplay = _t.unixTimestamp()
      }
      if (_t.unixTimestamp() >= _t.lastBannerDisplay + _t.bannerTimeout){
        _t.battle = null
        _t.currentDriver = null
      } 
    },500)
  },
  methods: {

    round(value){
      return  Math.round(value * 1000) / 1000
    },
    unixTimestamp(){
      return Math.round(+new Date()/1000)
    },
  },
  computed: {
    session(){
      return this.$store.state.session.infos.Session
    },
    drivers() {
      if (typeof this.$store.state.session.infos.Drivers !== 'undefined'){
        var drivers = JSON.parse(JSON.stringify(this.$store.state.session.infos.Drivers))
        drivers.sort(function(a,b) {return a.Position > b.Position ? 1 : -1}) 
        return drivers
      }
      return []
    },
    leftDisplayString() {
      if (typeof this.$store.state.session.infos.Session !== 'undefined'){
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
/* new approach */

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
  padding: 0.2em 2.5em !important;
  font-size: small; 
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.position-box {
  color: #343839;
  position: relative;
  top: -3em;
  width: 3em;
  height: 2.5em;
  left: 10em;
  padding: 0.75em 0em 0em 1em;
  font-weight: bold;
}
.subtext-box {
  left: -5px !important;
  color: #343839;
  padding: 0.1em 2.5em !important;
  font-size: small;
}
.logo-box {
  color: white;
  position: fixed;
  top: 0em;
  right: -6em;
  height: 6em;
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
  height: 3em;
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
/* electrolize-regular - latin */
@font-face {
  font-family: "Electrolize";
  font-style: normal;
  font-weight: 400;
  src: url("/fonts/electrolize-v6-latin-regular.eot"); /* IE9 Compat Modes */
  src: local("Electrolize"), local("Electrolize-Regular"),
    url("/fonts/electrolize-v6-latin-regular.eot?#iefix")
      format("embedded-opentype"),
    /* IE6-IE8 */ url("/fonts/electrolize-v6-latin-regular.woff2")
      format("woff2"),
    /* Super Modern Browsers */ url("/fonts/electrolize-v6-latin-regular.woff")
      format("woff"),
    /* Modern Browsers */ url("/fonts/electrolize-v6-latin-regular.ttf")
      format("truetype"),
    /* Safari, Android, iOS */
      url("/fonts/electrolize-v6-latin-regular.svg#Electrolize") format("svg"); /* Legacy iOS */
}

body {
  font: 100% Electrolize;  
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
