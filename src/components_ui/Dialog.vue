<template>
  <div
    class="fixed transition-all bg-neutral-800 p-3 rounded-md flex flex-col gap-3"
    :class="
      visible
        ? '-translate-x-1/2 -translate-y-1/2 left-1/2 top-1/2'
        : 'translate-0 opacity-0'
    "
    :style="{
      left: `${appStore.globlePosition.x}px`,
      top: `${appStore.globlePosition.y}px`
    }"
  >
    <div class="flex items-center justify-end">
      <img
        class="w-4 h-4 cursor-pointer"
        :src="CloseSvg"
        @click="appStore.dialog.visible = false"
      />
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
import CloseSvg from "@/assets/svg/close.svg";
import useApp from "@/store/app";
defineProps<{
  visible: boolean;
}>();

const emits = defineEmits(["update:visible"]);
const appStore = useApp();
</script>
