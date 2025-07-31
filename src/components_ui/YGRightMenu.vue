<template>
  <div @contextmenu.prevent>
    <div v-for="(item, index) in options" :key="index"></div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  options: {
    label: string,
    value: string,
  }[]
}>()
</script>