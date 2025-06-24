<template>
  <div
    class="fixed transition-all"
    :class="dialog.visible ? 'w-auto auto -translate-x-1/2 -translate-y-1/2' : 'w-0 h-0'"
    :style="{
      left: dialog.visible ? '50%' : `${positions.x}px`,
      top: dialog.visible ? '50%' : `${positions.y}px`,
    }"
  >
    <component :is="dialog.content" />
  </div>
</template>

<script setup lang="ts">
import { inject } from "vue";
import dialog from "@/hooks/useDialog";

const positions: { x: number; y: number } = inject("UI_DIALOG");
</script>
