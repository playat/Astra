<template>
  <LiquidGlass
    :border-radius="12"
    :width="block ? '100%' : 'auto'"
    :height="'auto'"
    :noise-strength="50"
    :glass-tint-color="'#ffffff'"
    :glass-tint-opacity="0.15"
    :frost-blur-radius="6"
    :block="block"
  >
    <button
      :disabled="disabled || loading"
      :class="[
        'glass-btn',
        block ? 'flex w-full' : 'inline-flex',
      ]"
    >
      <img class="loading-animate w-4 h-4" :src="LoadingSvg" v-if="loading" />
      <span class="glass-btn-content">
        <slot />
      </span>
    </button>
  </LiquidGlass>
</template>

<script setup lang="ts">
import LoadingSvg from "@/assets/svg/loading.svg";
import LiquidGlass from "./LiquidGlass.vue";

defineProps<{
  loading?: boolean;
  disabled?: boolean;
  block?: boolean;
}>();
</script>

<style scoped>
.glass-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  min-width: 100px;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.75rem;
  transition: all 0.3s ease;
  user-select: none;
}

.glass-btn:hover {
  color: white;
}

.glass-btn:active {
  transform: scale(0.98);
}

.glass-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.glass-btn-content {
  position: relative;
  z-index: 4;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-animate {
  position: relative;
  z-index: 4;
  animation: rotate 1s linear infinite;
  filter: invert(1);
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
