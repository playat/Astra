<template>
  <div
    class="grid overflow-scroll h-[60%] scrollbar-none auto-rows-max w-1/2 gap-5 absolute top-1/4 left-1/2 -translate-x-1/2 mt-5 transition-all duration-300"
    :class="
      appStore.isMore ? 'opacity-100 visible z-20' : 'opacity-0 invisible'
    "
    style="
      grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
      flex-shrink: 0;
    "
  >
    <div
      class="bg-[rgba(0,0,0,0.5)] backdrop-blur-20px w-20 h-20 inline-flex p-5 rounded-lg cursor-pointer mx-auto items-center justify-center"
      v-for="item in appStore.apps"
      :key="item.key"
      @click="appStore.openApp(item)"
    >
      <img :src="item.icon" class="w-8 h-8" />
    </div>
    <div
      class="bg-[rgba(0,0,0,0.5)] backdrop-blur-20px w-20 h-20 inline-flex p-5 rounded-lg cursor-pointer mx-auto items-center justify-center"
      @click="addApp"
    >
      <img :src="PlusSvg" class="w-8 h-8" />
    </div>
  </div>
</template>

<script setup lang="ts">
import useApp from "@/store/app";
import PlusSvg from "@/assets/svg/plus.svg";
import AddApp from "./AddApp.vue";
const appStore = useApp();

const addApp = () => {
  appStore.dialog.component = AddApp;
  appStore.dialog.visible = true;
};
</script>
