<template>
  <div class="w-full h-full relative overflow-hidden p-4 bg-gray-400">
    <SearchBar />
    <BottomBar />
  </div>
</template>

<script setup lang="ts">
import BottomBar from "@/components/BottomBar.vue";
import SearchBar from "@/components/SearchBar.vue"
</script>
