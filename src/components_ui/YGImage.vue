<template>
  <div class="relative w-full h-full bg-[#050505] overflow-hidden group border border-[#333]">
    <!-- Industrial Decor: Crosshairs -->
    <img
      v-bind="$attrs"
      referrerpolicy="no-referrer"
      draggable="false"
      @load="load"
      @error="error"
      class="transition-all duration-500 w-full h-full"
      :class="loading ? 'opacity-0' : 'opacity-80 group-hover:opacity-100'"
      :style="{
        objectFit: fit,
        opacity: isError ? 0 : undefined,
      }"
    />
    
    <!-- Error State -->
    <div
      class="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a0a] transition-all z-20"
      :class="isError ? 'opacity-100 visible' : 'opacity-0 invisible'"
    >
      <div class="text-[#333] border border-[#333] p-2 mb-2">
         <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
         </svg>
      </div>
      <span class="text-[10px] text-[#444] font-mono tracking-widest uppercase">ERR: LOAD_FAILED</span>
    </div>

    <!-- Loading State -->
    <div
      class="absolute inset-0 flex items-center justify-center bg-[#050505] transition-all z-20"
      :class="loading ? 'opacity-100 visible' : 'opacity-0 invisible'"
    >
      <div class="flex flex-col items-center gap-2">
        <div class="w-8 h-8 border border-[#333] relative">
          <div class="absolute inset-0 bg-[#333] animate-ping opacity-20"></div>
          <div class="absolute inset-1 bg-[#111] border border-[#222]"></div>
        </div>
        <span class="text-[10px] text-[#333] font-mono tracking-[0.2em] animate-pulse">LOADING</span>
      </div>
    </div>
    
    <!-- Slot for overlay/badges -->
    <slot name="overlay" />
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

defineProps<{
  fit?:
    | "contain"
    | "cover"
    | "fill"
    | "inherit"
    | "initial"
    | "none"
    | "scale-down"
    | "unset";
}>();

const loading = ref(true);
const isError = ref(false);

const clearLoading = () => {
  setTimeout(() => {
    loading.value = false;
  }, 300);
};

const load = () => {
  clearLoading();
};

const error = () => {
  clearLoading();
  isError.value = true;
};
</script>
