<template>
  <button
    :disabled="disabled"
    class="flex text-sm select-none justify-center items-center gap-[5px] min-w-[80px] px-3 py-2 rounded-lg bg-[#8e6ff7] cursor-pointer hover:bg-[#7953f5]"
  >
    <img class="loading-animate w-5 h-5" :src="LoadingSvg" v-if="loading" />
    <slot />
  </button>
</template>

<script setup lang="ts">
import LoadingSvg from "@/assets/svg/loading.svg";

defineProps<{
  loading?: boolean;
  disabled?: boolean;
}>();
</script>

<style scoped>
@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-animate {
  animation: rotate 1s linear infinite;
}
</style>
