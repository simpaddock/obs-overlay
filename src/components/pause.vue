<template>
  <div class="pause">
    <div class="content">
      <h1>Please stand by</h1>
      <img :src="config.logourl">
      <div class="branding">
        <img src="https://avatars1.githubusercontent.com/u/43098224?s=200&v=4">
      </div>
    </div>
  </div>
</template>

<script>
import config from "../../config"
export default {
  computed: {
    config(){
      return config
    }
  }
}
</script>

<style scoped>
.pause{
  background-color: #323737;
  color:white ;
  width: 100%;
  height: 100%;
  position: fixed;
  top: 0px;
  left: 0px;
  z-index: 100000000;
}
.content{
  margin-top: 15%;
  text-align: center;
}
.branding{
  position: fixed;
  bottom: 2em;
  right: 2em;
}
.branding img{
  width: 50px;
  vertical-align: middle;
}
</style>
