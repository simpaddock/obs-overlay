import Vuex from "vuex"
import Vue from "vue"
// Step 1
import Vapi from "vuex-rest-api"
import config from "../../config"

Vue.use(Vuex)

const posts = new Vapi({
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

const store = new Vuex.Store(posts)
export default store