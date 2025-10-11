<template>
  <div class="relative">
    <img
      v-bind="$attrs"
      referrerpolicy="no-referrer"
      draggable="false"
      @load="load"
      @error="error"
      class="transition-all"
      :class="loading ? 'opacity-0' : 'opacity-100'"
      :style="{
        objectFit: fit,
      }"
    />
    <div
      class="left-0 top-0 flex items-center justify-center bg-transparent absolute w-full h-full transition-all"
      :class="isError ? 'opacity-100 visible' : 'opacity-0 invisible'"
    >
      <slot v-if="$slots.error" name="error" />
      <img v-else :src="imgErrorSvg" class="w-4/5" />
    </div>
    <div
      class="left-0 top-1/2 -translate-y-1/2 absolute transition-all w-full h-full"
      :class="loading ? 'opacity-100 visible' : 'opacity-0 invisible'"
    >
      <YGImageLoading />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import YGImageLoading from "./YGImageLoading.vue";
import imgErrorSvg from "@/assets/svg/img_error.svg";

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
  }, 500);
};

const load = () => {
  clearLoading();
};

const error = () => {
  clearLoading();
  isError.value = true;
};
</script>
