<template>
  <div
    ref="bottomBarRef"
    class="backdrop-blur-6px bg-white-0\.15 p-2.5 rounded-xl mb-2.5 absolute left-1/2 z-10 -translate-x-1/2 bottom-0 flex gap-2 w-max"
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
      class="w-10 h-10 p-2 bg-black-0.5 rounded-lg cursor-pointer select-none backdrop-blur-6px flex items-center justify-center shrink-1"
      @click="addApp"
    >
      <img :src="PlusSvg" draggable="false" />
    </div>
  </div>
</template>

<script setup lang="ts">
import Draggable from "@/components_ui/Draggable.vue";
import useApp from "@/store/app";
import PlusSvg from "@/assets/svg/plus.svg";
import { onMounted, ref } from "vue";
import AddApp from "./AddApp.vue";
import gsap from "gsap";
const appStore = useApp();
const bottomBarRef = ref();
const isDrag = ref(false);
const openApp = (data: any) => {
  if (isDrag.value) return;
  appStore.openApp(data);
};

const addApp = () => {
  appStore.dialog.component = AddApp;
  appStore.dialog.visible = true;
};

onMounted(() => {
  gsap.fromTo(
    bottomBarRef.value,
    {
      y: `100%`,
      opacity: 0,
    },
    { y: 0, opacity: 1, ease: "elastic.out(1, 0.9)" }
  );
});
</script>
