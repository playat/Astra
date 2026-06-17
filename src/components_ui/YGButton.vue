<template>
  <button
    v-liquid-glass="glassOptions"
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
</template>

<script setup lang="ts">
import { computed } from "vue";
import LoadingSvg from "@/assets/svg/loading.svg";

const props = defineProps<{
  loading?: boolean;
  disabled?: boolean;
  block?: boolean;
}>();

const glassOptions = computed(() => ({
  borderRadius: 12,
  width: props.block ? '100%' : 'auto',
  height: 'auto',
  noiseStrength: 50,
  glassTintColor: '#ffffff',
  glassTintOpacity: 0.15,
  frostBlurRadius: 6,
  block: props.block,
}));
</script>

<style scoped>
.glass-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background: transparent;
  color: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  min-width: 100px;
  text-transform: uppercase;
  letter-spacing: 0.2em;
  font-size: 0.75rem;
  transition: all 0.3s ease;
  user-select: none;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1),
              inset 0 -1px 0 rgba(0, 0, 0, 0.1);
}

.glass-btn:hover {
  color: white;
  border-color: rgba(142, 111, 247, 0.5);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1),
              inset 0 -1px 0 rgba(0, 0, 0, 0.1),
              0 0 12px rgba(142, 111, 247, 0.3);
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
