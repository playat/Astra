<template>
  <div
    ref="bgRef"
    class="w-full h-full relative transition-all"
    @click="reset"
    @contextmenu="contextMenu"
  >
    <video
      v-if="appStore.bgCfn.type === 'video'"
      loop
      muted
      autoplay
      :src="appStore.bgCfn.url"
      class="w-full h-full object-cover"
    />
    <img
      v-if="appStore.bgCfn.type === 'image'"
      :src="appStore.bgCfn.url"
      class="w-full h-full object-cover"
    />
    <div
      class="absolute inset-0 bg-black/30 transition-all"
      :class="appStore.isMore ? 'backdrop-blur-6px' : ''"
    />
  </div>
</template>

<script setup lang="ts">
import useApp from "@/store/app";
import { onMounted, ref } from "vue";
import gsap from "gsap";
const appStore = useApp();
const bgRef = ref();
const reset = () => {
  appStore.searchFocus = false;
  appStore.isMore = false;
};

const contextMenu = (e) => {
  e.preventDefault();
  appStore.isMore = true;
};

onMounted(() => {
  gsap.fromTo(
    bgRef.value,
    {
      opacity: 0,
    },
    {
      opacity: 1,
      duration: 1,
      ease: "power2.inOut",
    }
  );
});
</script>
