import Vue from 'vue'

import ElementUI from 'element-ui'
// import VCharts from 'v-charts'
import 'element-ui/lib/theme-chalk/index.css'
// css
// import 'normalize.css/normalize.css'// A modern alternative to CSS resets
import '@/styles/index.scss' // global css
import 'babel-polyfill'
import App from './App'
import router from './router'
import store from './store'
import '@/permission' // permission control
import install from '@/utils/install'
import { SlickList, SlickItem } from 'vue-slicksort'
// import VueQuillEditor from 'vue-quill-editor'
import VueQriously from 'vue-qriously'

// require styles
// import 'quill/dist/quill.core.css'
// import 'quill/dist/quill.snow.css'
// import 'quill/dist/quill.bubble.css'

import * as filters from './filters' // global filters
Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key])
})
Vue.component('SlickList', SlickList)
Vue.component('SlickItem', SlickItem)
// Vue.use(VueQuillEditor, /* { default global options } */)
Vue.use(VueQriously)

// Vue.use(VCharts)
Vue.use(install)
Vue.use(ElementUI)
Vue.config.productionTip = false

new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
