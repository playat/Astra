<template>
  <template v-if="authStore.token">
    <!-- <BG />
    <BottomBar />
    <TimeNumber />
    <SearchBar />
    <SuList />
    <User /> -->
  </template>

  <Login v-else />

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
  true
);

const openChartPhysiology = () => {
  new CoverFixed({
    component: ChartPhysiology,
  }).open();
};

const showMsg = () => {
  setTimeout(() => {
    new Message({
      message: "今天吃什么嘞？",
    }).open();
    new Message({
      message: "不晓得哦",
    }).open();
    new Message({
      message: "我们去外面吃不",
    }).open();
  }, 1000);
  setTimeout(() => {
    new Message({
      message: "今天晚上要早点睡",
    }).open();
  }, 2000);
  setTimeout(() => {
    new Message({
      message: "回家后先打游戏 哈哈哈",
    }).open();
    new Message({
      message: "不可能不可能，怎么可以这么爽哦",
    }).open();
  }, 2500);
  setTimeout(() => {
    new Message({
      message: "原神！启动！！",
    }).open();
  }, 10000);
};
const test = () => {
  const dialog = new CoverDialog({
    component: YGDatePicker,
  });
  dialog.open();
};

onMounted(() => {
  test();
  // appStore.loadAppList();
  // showMsg();
});
</script>
