import Vuex from "vuex"
import Vue from "vue"
// Step 1
import Vapi from "vuex-rest-api"

Vue.use(Vuex)

const posts = new Vapi({
  baseURL: "http://localhost:5000",
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