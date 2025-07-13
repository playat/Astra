<template>
  <div
    class="grid overflow-scroll h-[65vh] scrollbar-none auto-rows-max w-1/2 gap-5 absolute top-1/4 left-1/2 -translate-x-1/2 mt-5 transition-all duration-300"
    :class="
      appStore.isMore ? 'opacity-100 visible z-20' : 'opacity-0 invisible'
    "
    style="grid-template-columns: repeat(auto-fill, minmax(80px, 1fr))"
  >
    <div
      class="bg-[rgba(0,0,0,0.5)] backdrop-blur-6px w-20 h-20 inline-block p-5 rounded-lg cursor-pointer"
      v-for="item in 120"
      :key="item"
    >
      <img :src="PlusSvg" class="w-10 h-10" />
    </div>
  </div>
</template>

<script setup lang="ts">
import useApp from "@/store/app";
import PlusSvg from "@/assets/svg/plus.svg";
const appStore = useApp();
</script>
