<template>
  <template v-if="appStore.token">
    <BG />
    <CenterBar />
    <BottomBar />
    <TimeNumber />
    <SearchBar />
    <SuList />
  </template>

  <Login v-else />

  <div
    class="fixed left-8 bottom-8 bg-black-0.5 rounded-full p-2 shadow cursor-pointer z-[999] text-white"
    @click="openChartPhysiology"
  >
    <img :src="ShenLiSvg" class="w-4 h-4" />
  </div>

  <!-- <div class="fixed left-0 top-0 z-10 bg-white w-full h-full">
    <YGButton class="fixed left-10 top-10" @click="test">  </YGButton>
  </div> -->
</template>

<script setup lang="ts">
import ShenLiSvg from "@/assets/svg/shen_li.svg";
import BottomBar from "@/components/BottomBar.vue";
import SearchBar from "@/components/SearchBar.vue";
import BG from "@/components/BG.vue";
import CenterBar from "@/components/CenterBar.vue";
import TimeNumber from "./components/TimeNumber.vue";
import useApp from "./store/app";
import SuList from "./components/SuList.vue";
import Login from "./components/Login.vue";
import { onMounted } from "vue";
import useFixed from "./hooks/useFixed";
import ChartPhysiology from "@/components_system/ChartPhysiology.vue";
import YGButton from "./components_ui/YGButton.vue";
import useDialog from "./hooks/useDialog";
import BgSetting from "./components_system/BGSetting.vue";

const fixed = useFixed();
const appStore = useApp();
const dialog = useDialog();
document.addEventListener(
  "mousedown",
  (event) => {
    appStore.globlePosition.x = event.clientX;
    appStore.globlePosition.y = event.clientY;
  },
  true
);

const openChartPhysiology = () => {
  fixed.open({
    component: ChartPhysiology,
  });
};

const test = () => {
  fixed.open({
    component: BgSetting,
  });
};

onMounted(() => {
  appStore.loadAppList();
});
</script>
