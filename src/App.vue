<template>
  <template v-if="authStore.token">
    <BG />
    <BottomBar />
    <TimeNumber />
    <SearchBar />
    <SuList />
    <User />
  </template>

  <Login v-else />

  <div
    v-if="authStore.token"
    class="fixed left-4 bottom-36 bg-black-0.5 rounded-full p-2 shadow cursor-pointer z-[999] text-white"
    @click="launchDefaultApps"
  >
    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/>
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/>
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/>
      <path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>
    </svg>
  </div>
  <div
    v-if="authStore.token"
    class="fixed left-4 bottom-22 bg-black-0.5 rounded-full p-2 shadow cursor-pointer z-[999] text-white"
    @click="openChartPhysiology"
  >
    <img :src="ShenLiSvg" class="w-4 h-4" />
  </div>
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
import BGSetting from "@/components_system/BGSetting.vue";
// import YGButton from "./components_ui/YGButton.vue";
import Message from "./components_ui/CoverMessage";
import CoverDialog from "./components_ui/CoverDialog";
import User from "./components/User.vue";
import YGDatePicker from "./components_ui/YGDatePicker/index.vue";
import DefaultApps from "@/components_system/DefaultApps.vue";

const appStore = useApp();
const authStore = useAuthStore();
document.addEventListener(
  "mousedown",
  (event) => {
    appStore.globlePosition.x = event.clientX;
    appStore.globlePosition.y = event.clientY;
  },
  true,
);

const openChartPhysiology = () => {
  new CoverFixed({
    component: ChartPhysiology,
  }).open();
};

const launchDefaultApps = () => {
  new CoverFixed({ component: DefaultApps, position: {
    top: window.innerHeight / 2 - 200,
    left: 100,
  } }).open();
};

const test = () => {
  new CoverDialog({
    component: YGDatePicker,
  }).open();
};

onMounted(() => {
  // test();
  appStore.loadAppList();
  // launchDefaultApps();
});
</script>
