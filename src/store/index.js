import Vuex from "vuex"
import Vue from "vue"
// Step 1
import Vapi from "vuex-rest-api"
import config from "../../config"

Vue.use(Vuex)

const session = new Vapi({
  namespaced: true,
  baseURL: config.timingurl,
  state: {
    infos: []
  }
})
.get({
  action: "getInfos",
  property: "infos",
  path: () => `/`
})
.getStore()


const control = new Vapi({
  namespaced: true,
  baseURL: config.controlurl,
  state: {
    'result': null
  }
})
.post({
  action: "updateControl",
  property: "result",
  path: () => `control/2`
})
.getStore()


const store = new Vuex.Store({
  modules: {
    session: session,
    control: control
  }
})
export default store