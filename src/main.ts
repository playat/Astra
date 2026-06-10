import { createApp } from "vue";
import App from "./App.vue";
import "@/styles/index.css";
import "@/styles/liquid-glass.css";
import { createPinia } from "pinia";
import "chartist/dist/index.css";
import { vLiquidGlass } from "@/directives/liquidGlass";

const app = createApp(App);
app.use(createPinia());
app.directive("liquid-glass", vLiquidGlass);
app.mount("#app");
