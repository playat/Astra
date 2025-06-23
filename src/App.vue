<template>
  <div class="w-full h-full relative overflow-hidden bg-gray-400">
    <BG />
    <div class="h-full w-full absolute left-0 top-0 flex flex-col">
      <SearchBar />
      <CenterBar />
      <!-- <BottomBar /> -->
    </div>
  </div>
</template>

<script setup lang="ts">
import BottomBar from "@/components/BottomBar.vue";
import SearchBar from "@/components/SearchBar.vue";
import BG from "@/components/BG.vue";
import CenterBar from "@/components/CenterBar.vue";
</script>
