<template>
  <div id="app">
    <div class="tree">
      <div class="left-display" v-if="session.IsSessionStarted">
        {{ leftDisplayString }}
      </div>
      <div class="left-display" v-if="!session.IsSessionStarted && !session.IsVCY">
        Session paused
      </div>
      <div class="left-display" v-if="session.IsVCY">
        Full Course Yellow <br>
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
            <span class="driver-position-gained" v-if="driver.CurrentSessionPositionDifference <0">&#9650;</span>
            <span class="driver-position-lost" v-if="driver.CurrentSessionPositionDifference >0">&#9660;</span>
          </span>
          
          <span :class="'driver-position-meta ' + driver.Status" v-if="session.IsRace && driver.Status == 'None'">
            <!-- Race -->
            {{ driver.LapsBehind == 0 ? (driver.Position !== 1 ? driver.TimeBehindString : driver.Laps +1)  : driver.LapsBehind }}
          </span>
          
          <span :class="'driver-position-meta ' + driver.Status" v-else-if="driver.Status == 'None'">
            <!-- practise, warmup etc. -->
            {{ driver.Position == 1 ? driver.BestLapString : driver.BestLapDeltaString }}
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
          {{ battle.gap }}
        </div>
        <driver :driver="battle.hunter" :enterclass="'slideInRight'" :leaveclass="'slideOutRight'"></driver>
    </div>

    <img class="logo" :src="logo" />
    <div class="sector-info" v-if="yellowSector.filter((s) => {return s}).length > 0">
      <div  v-for="(sector, sector_key) in yellowSector" :key="sector_key">
        <div v-if="sector === true" class="yellow-flag">Sector {{ sector_key +1}}</div> 
      </div>
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
      lastCommandId: 0,
      intervalId: null
    };
  },
  beforeDestroy(){
    clearInterval(this.intervalId)
  },
  created() {
    const _t = this
    this.intervalId = setInterval(function() {
      
      _t.$store.dispatch("getInfos")
      _t.lastControlSet = JSON.parse(_t.$store.state.infos.RaceOverlayControlSet)

      if (_t.lastCommandId != parseInt(_t.$store.state.infos.CommandId)){
        _t.lastSlotId =  _t.$store.state.infos.SlotId
        _t.lastCameraId = _t.$store.state.infos.CameraId;
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
          gap: this.session.IsRace ?  this.drivers[argument].TimeBehindString : this.drivers[argument].BestLapDeltaString 
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
    unixTimestamp(){
      return Math.round(+new Date()/1000)
    },
  },
  computed: {
    session(){
      return this.$store.state.infos.Session
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
        return this.$store.state.infos.Session.SessionLeftString
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
  width: 10%;
  text-align: center;
  padding-left: 2%;
  padding-right: 2%;
  font-weight: bold;
}
.battle-title{
  font-weight: bold;
  margin-bottom: 1em;
  font-size: large;
}
.battle-gap-arrow{
  color: red;
  font-size: 20pt;
  font-weight: bolder;
  text-align: center;
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
  width: 200px;
  display: table;
  background: #323737;
  color: white;
  padding-bottom: 0.4em;
}
.driver-position-name {
  display: table-cell;
  width: 50%;
}
.driver-position-meta {
  display: table-cell;
  font-size: 9pt;
  text-align: right;
}
.driver-position-number {
  width: 5%;
  display: table-cell;
  padding-right: 0.4em;
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
.driver-position-gained{
  color: #9eef00
}
.driver-position-lost{
  color: #ff5a00;
}
.yellow-flag{
  background: yellow;
  border: 1px solid black;
  padding: 0.5em;
  font-weight: bold;
  text-transform: uppercase;
  margin-bottom: 0.5em;
}
</style>
