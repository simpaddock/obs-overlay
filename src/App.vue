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
      <driver :driver="battle.hunted"></driver>
      <div class="battle-gap">
        <div class="battle-gap-arrow">&harr;</div>
        {{ round(battle.gap) }}
      </div>
      <driver :driver="battle.hunter"></driver>
    </div>

    <img class="logo"
         :src="logo" />
    <div class="sector-info" v-if="yellowSector !== null">
      Yellow flag:
      <span class="sector" v-for="(sector, sector_key) in yellowSector" :key="sector_key">Sector {{ sector.replace("Sector State ", "")}}</span>
    </div>
    <div class="current-driver">
      <driver v-if="currentDriver !== null" :driver="currentDriver"></driver>
    </div>
  </div>
</template>

<script>
import store from "./store";
import driver from "./components/driver";
import config from "../config"
import momentjs from "moment"

export default {
  components: {
    driver
  },
  store,
  name: "app",
  data() {
    return {
      logo: config.logourl,
      battle: null
    };
  },
  created() {
    setInterval(() => {
      this.$store.dispatch("getInfos")
      this.battle = this.closestBattleForPositionText
    },1000)
  },
  methods: {
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
  },
  computed: {
    currentDriver() {
      return null;
      return typeof this.$store.state.infos.Drivers !== 'undefined' ? this.$store.state.infos.Drivers[5] : null;
    },
    closestBattleForPosition(){
      return 5;
      return this.battlesForPosition.indexOf(Math.min(...this.battlesForPosition));
    },
    closestBattleForPositionText(){
      if (this.closestBattleForPosition == -1){
        return null
      } else{
        return {
          hunted: this.drivers[this.closestBattleForPosition-1],
          hunter: this.drivers[this.closestBattleForPosition],
          gap: this.battlesForPosition[this.closestBattleForPosition]
        }
      }
    },
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
