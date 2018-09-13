<template>

  <transition name="fxade"
    :enter-active-class="'animated ' +enterclass"
    :leave-active-class="'animated ' +leaveclass">
    <div class="driver-info">
      <div class="driver-info-name">
        <span class="driver-number" v-html="number"></span> 
        <span class="driver-clearname">{{ driver.FirstName }} {{ driver.LastName }}</span> 
      </div>
      <div class="driver-info-team-name">
        {{ driver.TeamName }}
      </div>
    </div>
  </transition>
</template>

<script>
import animate from '../../node_modules/animate.css'
export default {
  props: [
    'driver',
    'enterclass',
    'leaveclass'
  ],
  computed: {
    number(){
      return typeof  this.driver !== 'undefined' ? this.driver.NumberFormat.replace("{0}", this.driver.Number ) : "" //TODO: STRING:REPLACE
    }
  }
}
</script>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
.driver-info {
  background: #323737;
  color: white;
  border: 1px solid #323737;
  display: inline-block;
  font-size: 20pt;
  min-width: 200px;
}
.driver-info-name {
  background: 232323;
  padding-top: 0.2em;
  padding-left: 0.2em;
  padding-right: 0.2em;
  color: white;
}
.driver-info-team-name {
  padding-left: 0.4em;
  font-size: 12pt;
  padding-top: 0.2em;
  padding-right: 0.4em;
  padding-bottom: 0.4em;
}
.driver-number {
  margin-right: 0.5em;
}
</style>
