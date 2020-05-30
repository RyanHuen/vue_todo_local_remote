import Vue from 'vue'
import App from './App.vue'
import './registerServiceWorker'
import router from './router'
import store from './store'

import {library} from '@fortawesome/fontawesome-svg-core'
import {faEllipsisV, faEdit} from '@fortawesome/free-solid-svg-icons'
import {FontAwesomeIcon} from '@fortawesome/vue-fontawesome'
import VueMobileDetection from 'vue-mobile-detection'

import axios from 'axios'
import VueAxios from 'vue-axios'

import 'vue-beauty/package/style/vue-beauty.min.css'
import vueBeauty, {alert} from 'vue-beauty'

Vue.prototype.axios = axios
Vue.use(VueAxios, axios)

Vue.use(vueBeauty)
Vue.use(alert)

Vue.use(VueMobileDetection)

library.add(faEllipsisV, faEdit)

Vue.component('font-awesome-icon', FontAwesomeIcon)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
