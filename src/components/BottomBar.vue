<template>
  <div
    class="backdrop-blur-6px bg-white-0\.15 p-2.5 rounded-xl mx-auto mb-2.5 absolute left-1/2 -translate-x-1/2 bottom-0 flex items-center gap-2"
  >
    <Draggable v-model:list="appStore.apps" v-model:is-drag="isDrag">
      <template #default="{ data }">
        <div
          @click="openApp(data)"
          class="w-10 h-10 p-2 bg-black-0.5 rounded-lg cursor-pointer select-none backdrop-blur-6px"
        >
          <img
            class="w-full hfull"
            :src="data.icon"
            draggable="false"
            referrerpolicy="no-referrer"
          />
        </div>
      </template>
    </Draggable>
    <div
      class="w-10 h-10 p-2 bg-black-0.5 rounded-lg cursor-pointer select-none backdrop-blur-6px"
      @click="addApp"
    >
      <img :src="PlusSvg" draggable="false" referrerpolicy="no-referrer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import Draggable from "@/components_ui/Draggable.vue";
import useApp from "@/store/app";
import PlusSvg from "@/assets/svg/plus.svg";
import { ref } from "vue";
import AddApp from "./AddApp.vue";
const appStore = useApp();

const isDrag = ref(false);
const openApp = (data: any) => {
  if (isDrag.value) return;
  if (!data.isDefault) {
    window.open(data.key, "_blank");
  } else {
    appStore.dialog.component = data.component;
    appStore.dialog.visible = true;
  }
};

const addApp = () => {
  appStore.dialog.component = AddApp;
  appStore.dialog.visible = true;
};
</script>
