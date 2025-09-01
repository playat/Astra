<template>
  <template v-if="appStore.token">
    <BG />
    <CenterBar />
    <BottomBar />
    <TimeNumber />
    <SearchBar />
    <SuList />
    <YGFixed />
    <YGDialog />
  </template>

  <Login v-else />

  <div
    class="fixed left-10 bottom-10 bg-black-0.5 rounded-full p-2 shadow cursor-pointer z-[999] text-white"
    @click="testChart"
  >
    <img :src="ShenLiSvg" class="w-4 h-4" />
  </div>
  <!-- <Login /> -->
  <!-- <YGFixed />

  
  <YGButton class="fixed left-10 top-10" @click="testChart">
    测试图表
  </YGButton> -->
</template>

<script setup lang="ts">
import ShenLiSvg from "@/assets/svg/shen_li.svg";
import BottomBar from "@/components/BottomBar.vue";
import SearchBar from "@/components/SearchBar.vue";
import BG from "@/components/BG.vue";
import CenterBar from "@/components/CenterBar.vue";
import TimeNumber from "./components/TimeNumber.vue";
import YGDialog from "./components_ui/YGDialog.vue";
import useApp from "./store/app";
import SuList from "./components/SuList.vue";
import Login from "./components/Login.vue";
import { onMounted } from "vue";
import YGFixed from "./components_ui/YGFixed.vue";
import useFixed from "./hooks/useFixed";
import Chart from "@/components/Chart.vue";

import YGButton from "./components_ui/YGButton.vue";

const fixed = useFixed();
const appStore = useApp();

document.addEventListener(
  "mousedown",
  (event) => {
    appStore.globlePosition.x = event.clientX;
    appStore.globlePosition.y = event.clientY;
  },
  true
);

const testChart = () => {
  fixed.open({
    component: Chart,
  });
};

onMounted(() => {
  appStore.loadAppList();
});
</script>
