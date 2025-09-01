import { createApp } from "vue";
import App from "./App.vue";
import "@/styles/index.css";
import { createPinia } from "pinia";
import "chartist/dist/index.css";

const app = createApp(App);
app.use(createPinia());
app.mount("#app");
