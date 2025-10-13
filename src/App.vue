<template>
  <!-- <template v-if="authStore.token">
    <BG />
    <BottomBar />
    <TimeNumber />
    <SearchBar />
    <SuList />
  </template>

  <Login v-else /> -->

  <BGSetting />

  <div
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
import BGSetting from "@/components_system/BGSetting.vue";
import BG from "@/components/BG.vue";
import TimeNumber from "./components/TimeNumber.vue";
import useApp from "./store/app";
import SuList from "./components/SuList.vue";
import Login from "./components/Login.vue";
import { onMounted } from "vue";
import Fixed from "./components_ui/Fixed";
import ChartPhysiology from "@/components_system/ChartPhysiology.vue";
import useAuthStore from "./store/auth";

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
  new Fixed().open({
    component: ChartPhysiology,
  });
};

const test = () => {};

onMounted(() => {
  appStore.loadAppList();
});
</script>
