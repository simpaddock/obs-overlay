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
            {{ driver_key +1 }}
          </span>
          <span class="driver-position-name">
            {{ driver.lastName }}
          </span>
          <span :class="'driver-position-meta ' + driver.status">
            {{ driver.status }}
          </span>
        </div>
      </div>
    </div>
    <img class="logo"
         :src="logo" />
    <div class="sector-info" v-if="yellowSector.length > 0">
      Yellow flag:
      <span class="sector" v-for="(sector, sector_key) in yellowSector" :key="sector_key">Sector {{ sector.replace("Sector State ", "")}}</span>
    </div>
    <div v-if="currentDriver !== null"
         class="driver-info">
      <div class="driver-info-name">
        <span class="driver-number"
              v-html="currentDriver.numberString"></span> {{ currentDriver.firstName }} {{ currentDriver.lastName }}
      </div>
      <div class="driver-info-team-name">
        {{ currentDriver.teamName }}
      </div>
    </div>
  </div>
</template>

<script>
import store from "./store";

export default {
  store,
  name: "app",
  data() {
    return {
      logo: "logo.png"
    };
  },
  created() {
    setInterval(() => {
      this.$store.dispatch("getInfos")
    },2500)
  },
  computed: {
    currentDriver() {
      return this.$store.state.infos.currentDriver
      return {
        position: 4,
        firstName: "FirstName",
        lastName: "lastName",
        code: "FNLN",
        numberString: "<i style='color:orange;font-weight:bold;'>42</i>",
        teamName: "SNM Wahlmeier"
      };
    },
    drivers() {
      return this.$store.state.infos.drivers;
    },
    leftDisplayString() {
      return typeof this.$store.state.infos.session !== 'undefined'  ? this.$store.state.infos.session["LeftDisplayString"] : ""
    },
    yellowSector() {
      var sectors = []
      if (typeof this.$store.state.infos.session !== 'undefined'){
        for (var key in this.$store.state.infos.session) {
          var value = this.$store.state.infos.session[key]
          if (key.indexOf("Sector State") !== -1 &&  value !== "green"){
            sectors.push(key)
          }
        }
      }
      return sectors
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
.driver-info {
  background: #323737;
  color: white;
  border: 1px solid #323737;
  width: auto;
  display: inline-block;
  position: fixed;
  bottom: 5em;
  right: 1em;
  font-size: 20pt;
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
.driver-info-name {
  background: 232323;
  padding-top: 0.2em;
  padding-left: 0.4em;
  padding-right: 0.4em;
  color: white;
}
.driver-info-team-name {
  padding-left: 0.4em;
  font-size: 15pt;
  padding-top: 0.2em;
}
.driver-number {
  margin-right: 0.5em;
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
</style>
