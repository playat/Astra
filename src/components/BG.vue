<template>
  <div class="w-full h-full">
    <video v-if="appStore.bgCfn.type === 'video'" :src="appStore.bgCfn.url" class=" w-full h-full" />
    <img v-if="appStore.bgCfn.type === 'image'" :src="appStore.bgCfn.url" class=" w-full h-full" />
  </div>
</template>

<script setup lang="ts">
import useApp from "@/store/app";
const appStore = useApp()


</script>