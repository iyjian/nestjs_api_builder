import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { createPinia } from "pinia";
import piniaPersist from "pinia-plugin-persist";
import "./style.styl";

const pinia = createPinia();
pinia.use(piniaPersist);

const app = createApp(App);
// .use(store, key)

app.use(ElementPlus).use(pinia).use(router).mount("#app");
