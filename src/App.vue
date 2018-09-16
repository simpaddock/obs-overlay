<template>
  <div id="app">
    <div class="tree">
      <div class="left-display">
        {{ leftDisplayString }}
      </div>
      <div v-for="(driver, driver_key) in drivers"
           v-bind:key="driver_key">
        <div class="driver-position">
          <span class="driver-position-number">
            {{ driver.Position }}
          </span>
          <span class="driver-position-name">
            {{ driver.LastName }}
          </span>
          <span :class="'driver-position-meta ' + driver.Status" v-if="driver.Status == 'None'">
            {{ driver.LapsBehind == 0 ? (driver.Position !== 1 ? round(driver.TimeBehind) : driver.Laps +1)  : driver.LapsBehind }}
          </span>
          
          <span :class="'driver-position-meta ' + driver.Status" v-if="driver.Status != 'None'">
            {{ driver.Status }}
          </span>
        </div>
      </div>
    </div>
    
    <div class="battle" v-if="battle !== null">
        <div class="battle-title">
          Battle for position {{ lastControlSet.battle }}
        </div>
        <driver :driver="battle.hunted" :enterclass="'slideInLeft'" :leaveclass="'slideOutLeft'"></driver>
        <div class="battle-gap">
          <div class="battle-gap-arrow">&harr;</div>
          {{ round(battle.gap) }}
        </div>
        <driver :driver="battle.hunter" :enterclass="'slideInRight'" :leaveclass="'slideOutRight'"></driver>
    </div>

    <img class="logo" :src="logo" />
         
    <div class="sector-info" v-if="yellowSector.filter((s) => {return s}).length > 0">
      <span class="sector" v-for="(sector, sector_key) in yellowSector" :key="sector_key">
        <span v-if="sector === true">
          Sector {{ sector_key +1}}
        </span>
      </span>
    </div>
    <div class="current-driver">
      <driver v-if="currentDriver !== null" :driver="currentDriver"  :enterclass="'flipInX'" :leaveclass="'flipOutX'"></driver>
    </div>
  </div>
</template>

<script>
import store from "./store";
import driver from "./components/driver";
import config from "../config"
export default {
  components: {
    driver
  },
  store,
  name: "app",
  data() {
    return {
      logo: config.logourl,
      battle: null,
      lastControlSet: null,
      currentDriver: null,
      lastCameraId: null,
      lastSlotId: null,
      bannerTimeout: 6, // seconds to display something,
      lastBannerDisplay: 0,
      lastCommandId: 0
    };
  },
  created() {
    const _t = this
    setInterval(function() {
      
      _t.$store.dispatch("getInfos")
      _t.lastControlSet = JSON.parse(_t.$store.state.infos.RaceOverlayControlSet)
      var newCamera = _t.$store.state.infos.CameraId
      var newSlot = _t.$store.state.infos.SlotId
      var newCommandId = parseInt(_t.$store.state.infos.CommandId)
      if (_t.lastCommandId != newCommandId){
        _t.lastSlotId = newSlot
        _t.lastCameraId = newCamera;
        _t.lastBannerDisplay = _t.unixTimestamp()
      }
      _t.applyControlSet()
      if (_t.unixTimestamp() >= _t.lastBannerDisplay + _t.bannerTimeout){
        _t.battle = null
        _t.currentDriver = null
      } 
      
      _t.lastCommandId = parseInt(JSON.parse(JSON.stringify(_t.$store.state.infos.CommandId)))
    },1000)
  },
  methods: {
    applyControlSet(){
      this.battle = null
      var keys = Object.keys(this.lastControlSet)
      var argument  = this.lastControlSet[keys[0]]
      if (keys.indexOf("battle") !== -1){
        this.currentDriver = null
        this.battle = {
          hunted: this.drivers[argument-1],
          hunter: this.drivers[argument],
          gap: this.battlesForPosition[argument]
        }
      }
      if (keys.indexOf("currentDriver") !== -1){
        for (var i in this.drivers){
          if (this.drivers[i].SlotID ===  this.$store.state.infos.SlotId){
           
            this.currentDriver = this.drivers[i]
            break
          }
        }
      }
    },
    round(value){
      return  Math.round(value * 1000) / 1000
    },
    formatTime(value){
      // I'm lazy. https://stackoverflow.com/questions/6312993/javascript-seconds-to-time-string-with-format-hhmmss
      var hours   = Math.floor(value / 3600);
      var minutes = Math.floor((value - (hours * 3600)) / 60);
      var seconds = Math.floor(value - (hours * 3600) - (minutes * 60));

      if (hours   < 10) {hours   = "0"+hours;}
      if (minutes < 10) {minutes = "0"+minutes;}
      if (seconds < 10) {seconds = "0"+seconds;}
      return hours+':'+minutes+':'+seconds;
    },
    unixTimestamp(){
      return Math.round(+new Date()/1000)
    },
  },
  computed: {
    battlesForPosition(){
      var battles = []
      this.drivers.forEach((current, index) => {
        var previous = index !== 0 ? this.drivers[index-1] : null
        if (previous !== null){
          var gap = current.TimeBehind
          if (gap !== 0){
            battles[index] = gap
          }
        } else{
          battles[0] = Number.MAX_SAFE_INTEGER
        }
      });
      return battles
    },
    drivers() {
      if (typeof this.$store.state.infos.Drivers !== 'undefined'){
        var drivers = JSON.parse(JSON.stringify(this.$store.state.infos.Drivers))
        drivers.sort(function(a,b) {return a.Position > b.Position ? 1 : -1}) 
        return drivers
      }
      return []
    },
    leftDisplayString() {
      if (typeof this.$store.state.infos.Session !== 'undefined'){
        var session = this.$store.state.infos.Session
        if (session.MaxLaps === 2147483647) {
          return this.formatTime(session.CurrentTime) + " /" + this.formatTime(session.MaxTime)
        } else{
          return session.CurrentLaps + " /" + session.MaxLaps
        }
      }
      return ""
    },
    yellowSector() {
      if (typeof this.$store.state.infos.Session !== 'undefined'){
        return this.$store.state.infos.Session["YellowFlags"]
      }
      return []
    }
  }
};
</script>

<style>
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
}
.logo {
  position: fixed;
  top: 1em;
  right: 1em;
  width: 7%;
}
.current-driver{
  position: absolute;
  bottom: 5em;
  right: 1em;
}
.battle-gap{
  display: inline-block;
  width: 5%;
  text-align: center;
  padding-left: 2%;
  padding-right: 2%;
  font-weight: bold;
}
.battle-title{
  font-weight: bold;
  margin-bottom: 1em;
}
.battle-gap-arrow{
  color: red;
  font-size: 20pt;
  font-weight: bolder;
  text-align: center;
}
.sector-info{
  background: #323737;
  color: yellow;
  position: fixed;
  right: 1em;
  top: 20%;
  right: 1em;
  padding-top: 0.2em;
  padding-left: 0.4em;
  padding-right: 0.4em;
  padding-bottom: 0.2em;
  font-size: 15pt;
}
.sector{
  font-weight: bold;
  padding-left: 0.4em;
}

.tree {
  position: fixed;
  top: 1em;
  background: #323737;
  color: white;
  padding-left: 0.3em;
  padding-top: 0.4em;
  padding-bottom: 0.4em;
  padding-right: 0.4em;
}
.driver-position {
  width: 160px;
  display: table;
  background: #323737;
  color: white;
  padding-bottom: 0.4em;
}
.driver-position-name {
  display: table-cell;
  width: 80%;
}
.driver-position-meta {
  display: table-cell;
  font-size: 9pt;
}
.driver-position-number {
  width: 27px;
  display: inline-block;
}
.pit {
  color: #f62828;
  font-weight: bold;
  text-transform: uppercase;
}
.out {
  color: #00f000;
  font-weight: bold;
  text-transform: uppercase;
}
.dnf {
  text-transform: uppercase;
  color: white;
  font-weight: bold;
}
.dns {
  color: #fff300;
  text-transform: uppercase;
  font-weight: bold;
}
.dq {
  color: red;
  text-transform: uppercase;
  font-weight: bold;
}
.left-display {
  text-align: center;
  font-size: 10pt;
  margin-bottom: 0.7em;
  border-bottom: 1px solid white;
  padding-bottom: 0.2em;
}
.battle{
  position: fixed;
  bottom: 5em;
  width: 40%;
  left: 35%;
}
</style>
