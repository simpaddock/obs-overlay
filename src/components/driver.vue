<template>
  <div class="driver-info">
    <div class="driver-info-name">
      <span class="driver-number" v-html="number"></span> {{ driver.FirstName }} {{ driver.LastName }}
    </div>
    <div class="driver-info-team-name">
      {{ driver.TeamName }}
    </div>
  </div>
</template>

<script>
export default {
  props: [
    'driver'
  ],
  computed: {
    number(){
      return typeof  this.driver !== 'undefined' ? this.driver.NumberFormat.replace("{0}", this.driver.Number ) : "" //TODO: STRING:REPLACE
    }
  }
}
</script>

<style>

.driver-info {
  background: #323737;
  color: white;
  border: 1px solid #323737;
  width: 300px;
  display: inline-block;
  font-size: 20pt;
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
</style>
