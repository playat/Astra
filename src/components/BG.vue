<template>
  <div class="w-full h-full relative">
    <div class="absolute inset-0 bg-black/30"></div>
    <video
      v-if="appStore.bgCfn.type === 'video'"
      loop
      muted
      autoplay
      :src="appStore.bgCfn.url"
      class="w-auto h-full object-cover"
    />
    <img
      v-if="appStore.bgCfn.type === 'image'"
      :src="appStore.bgCfn.url"
      class="w-full h-full object-cover"
    />
  </div>
</template>

<script setup lang="ts">
import useApp from "@/store/app";
const appStore = useApp();
</script>
