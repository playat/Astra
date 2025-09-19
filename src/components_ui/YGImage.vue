<template>
  <div class="w-full h-full">
    <img
      :src="src"
      referrerpolicy="no-referrer"
      draggable="false"
      @load="load"
    />
    <slot name="placeholder" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

defineProps<{
  src: string;
}>();

const;
const isOK = ref(false);
</script>
