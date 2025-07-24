<template>
  <div class="relative cursor-pointer">
    <div @click.stop="isVisible = !isVisible">
      <slot />
    </div>
    <div
      class="absolute transition-[transform] top-full mt-4 left-1/2 -translate-1/2 p-2 backdrop-blur-20px bg-white-0.15"
      :class="!isVisible ? '-translate-y-1 invisible' : 'visible'"
    >
      13
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const isVisible = ref(false);
</script>
