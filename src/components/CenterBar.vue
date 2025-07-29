<template>
  <div
    class="overflow-scroll h-[60%] scrollbar-none w-1/2 absolute top-1/4 left-1/2 -translate-x-1/2 mt-5 transition-all duration-300"
    :class="
      appStore.isMore ? 'opacity-100 visible z-20' : 'opacity-0 invisible'
    "
    style="flex-shrink: 0"
  >
    <!-- grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); -->
    <Draggable
      class="w-full !gap-5 grid"
      style="grid-template-columns: repeat(auto-fill, minmax(80px, 1fr))"
      v-model:list="appStore.apps"
      v-model:is-drag="isDrag"
    >
      <template #default="{ data }">
        <div
          class="bg-[rgba(0,0,0,0.5)] backdrop-blur-20px w-20 h-20 inline-flex p-5 rounded-lg cursor-pointer mx-auto items-center justify-center"
          @click="
            () => {
              if (!isDrag) {
                appStore.openApp(data);
              }
            }
          "
        >
          <img :draggable="false" :src="data.icon" class="w-8 h-8" />
        </div>
      </template>
    </Draggable>

    <!-- <div
      class="bg-[rgba(0,0,0,0.5)] backdrop-blur-20px w-20 h-20 inline-flex p-5 rounded-lg cursor-pointer mx-auto items-center justify-center"
      @click="addApp"
    >
      <img :src="PlusSvg" class="w-8 h-8" />
    </div> -->
  </div>
</template>

<script setup lang="ts">
import useApp from "@/store/app";
import PlusSvg from "@/assets/svg/plus.svg";
import AddApp from "./AddApp.vue";
import Draggable from "@/components_ui/Draggable.vue";
import { ref } from "vue";
const appStore = useApp();
const isDrag = ref(false);
const addApp = () => {
  appStore.dialog.component = AddApp;
  appStore.dialog.visible = true;
};
</script>
