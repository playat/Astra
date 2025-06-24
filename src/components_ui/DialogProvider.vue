<template>
  <slot/>
  <Dialog />
</template>

<script setup lang="ts">
import { provide, reactive } from 'vue';
import Dialog from './Dialog.vue';
const mousePosition = reactive({
  x: 0,
  y: 0,
})

document.addEventListener('mousedown', (event) => {
  mousePosition.x = event.clientX
  mousePosition.y = event.clientY
}, true);


provide("UI_DIALOG", mousePosition)
</script>