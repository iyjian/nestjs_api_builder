import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import 'bootstrap/dist/css/bootstrap.min.css'
import { createPinia } from 'pinia'
import piniaPersist from 'pinia-plugin-persist'
import './style.styl'
import { createHistory } from 'vue3-history'

const pinia = createPinia()
pinia.use(piniaPersist)

const Vue3History = createHistory({
  router,
  debug: false,
})

const app = createApp(App)
// .use(store, key)

app.use(ElementPlus).use(pinia).use(router).use(Vue3History).mount('#app')
