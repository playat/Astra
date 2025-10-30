<template>
  <template v-if="authStore.token">
    <!-- <BG />
    <BottomBar />
    <TimeNumber />
    <SearchBar />
    <SuList /> -->
  </template>

  <Login v-else />

  <div
    class="fixed left-4 bottom-22 bg-black-0.5 rounded-full p-2 shadow cursor-pointer z-[999] text-white"
    @click="openChartPhysiology"
  >
    <img :src="ShenLiSvg" class="w-4 h-4" />
  </div>
  <!-- <YGButton @click="test">test</YGButton> -->
</template>

<script setup lang="ts">
import ShenLiSvg from "@/assets/svg/shen_li.svg";
import BottomBar from "@/components/BottomBar.vue";
import SearchBar from "@/components/SearchBar.vue";
import BG from "@/components/BG.vue";
import TimeNumber from "./components/TimeNumber.vue";
import useApp from "./store/app";
import SuList from "./components/SuList.vue";
import Login from "./components/Login.vue";
import { onMounted } from "vue";
import CoverFixed from "./components_ui/CoverFixed";
import ChartPhysiology from "@/components_system/ChartPhysiology.vue";
import useAuthStore from "./store/auth";
// import YGButton from "./components_ui/YGButton.vue";
import Message from "./components_ui/CoverMessage";

const appStore = useApp();
const authStore = useAuthStore();
document.addEventListener(
  "mousedown",
  (event) => {
    appStore.globlePosition.x = event.clientX;
    appStore.globlePosition.y = event.clientY;
  },
  true
);

const openChartPhysiology = () => {
  new CoverFixed({
    component: ChartPhysiology,
  }).open();
};

const test = () => {
  const dialog = new Message({
    message: "今晚吃点不一样的",
  });
  dialog.open();
};

onMounted(() => {
  appStore.loadAppList();
  new Message({
    message: "你好，今天吃什么嘞"
  }).open()
});
</script>
