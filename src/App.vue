<template>
  <BG />
  <CenterBar />
  <BottomBar />
  <TimeNumber />
  <SearchBar />
  <SuList />
  <Dialog>
    <component :is="appStore.dialog.component" />
  </Dialog>
  <!-- <div class="fixed left-0 top-0">{{ appStore.globlePosition }}</div> -->

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
import { onMounted } from "vue";
import { getAppLsit } from "./api/app";

const appStore = useApp();

document.addEventListener(
  "mousedown",
  (event) => {
    appStore.globlePosition.x = event.clientX;
    appStore.globlePosition.y = event.clientY;
  },
  true
);

onMounted(() => {
  getAppLsit().then((res) => {
    appStore.apps = [...appStore.apps, ...res.data];
  });
});
</script>
