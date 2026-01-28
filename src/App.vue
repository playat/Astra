<template>
  <!-- <template v-if="authStore.token">
    <BG />
    <BottomBar />
    <TimeNumber />
    <SearchBar />
    <SuList />
    <User />
  </template>

  <Login v-else /> -->

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

const test = () => {
  new CoverDialog({
    component: YGDatePicker,
  }).open();
};

onMounted(() => {
  // test();
  appStore.loadAppList();
});
</script>
