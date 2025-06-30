<template>
  <BG />
  <!-- <CenterBar /> -->
  <BottomBar />
  <TimeNumber />
  <SearchBar />
  <SuList/>
  <Dialog v-model:visible="appStore.dialog.visible">
    <component :is="appStore.dialog.component" />
  </Dialog>
</template>

<script setup lang="ts">
import BottomBar from "@/components/BottomBar.vue";
import SearchBar from "@/components/SearchBar.vue";
import BG from "@/components/BG.vue";
import CenterBar from "@/components/CenterBar.vue";
import TimeNumber from "./components/TimeNumber.vue";
import Dialog from "./components_ui/Dialog.vue";
import useApp from "./store/app";
import SuList from "./components/SuList.vue";

const appStore = useApp();

document.addEventListener(
  "mousedown",
  (event) => {
    appStore.globlePosition.x = event.clientX;
    appStore.globlePosition.y = event.clientY;
  },
  true
);
</script>
