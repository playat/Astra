<template>
  <button
    :disabled="disabled || loading"
    :class="[
      'cursor-pointer items-center justify-center gap-2 px-4 py-3 bg-[#111] border border-[#333] text-white uppercase tracking-[0.2em] text-xs hover:bg-white hover:text-black hover:border-white transition-all duration-300 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed select-none min-w-[100px]',
      block ? 'flex w-full' : 'inline-flex',
    ]"
  >
    <img class="loading-animate w-4 h-4 invert dark:invert-0" :src="LoadingSvg" v-if="loading" />
    <slot />
  </button>
</template>

<script setup lang="ts">
import LoadingSvg from "@/assets/svg/loading.svg";

defineProps<{
  loading?: boolean;
  disabled?: boolean;
  block?: boolean;
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

/* 当按钮背景变白时（hover状态），确保loading图标颜色反转以保持可见性 */
button:hover .loading-animate {
  filter: invert(1);
}
</style>
