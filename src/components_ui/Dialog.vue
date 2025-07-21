<template>
  <div
    ref="dialogRef"
    class="fixed bg-neutral-800 p-3 rounded-md flex flex-col gap-3"
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
import { nextTick, ref, watch } from "vue";

const dialogRef = ref();
const emits = defineEmits(["update:visible"]);
const appStore = useApp();
const position = ref({
  x: 0,
  y: 0,
});
watch(
  () => appStore.dialog.visible,
  (newVal) => {
    if (newVal) {
      dialogRef.value.style.top = `${appStore.globlePosition.y}px`;
      dialogRef.value.style.left = `${appStore.globlePosition.x}px`;
      nextTick(() => {
        dialogRef.value.classList.add("transition-all");
        const layout = dialogRef.value.getBoundingClientRect();
        dialogRef.value.style.left = `${
          window.innerWidth / 2 - layout.width / 2
        }px`;
        dialogRef.value.style.top = `${
          window.innerHeight / 2 - layout.height / 2
        }px`;
      });
    }
  }
);
</script>
