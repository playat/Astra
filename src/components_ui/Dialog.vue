<template>
  <div
    ref="dialogRef"
    class="fixed bg-neutral-800 p-3 rounded-md flex flex-col gap-3 overflow-hidden scale-0 -translate-x-1/2 -translate-y-1/2"
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
import { ref, watch } from "vue";

const dialogRef = ref<HTMLElement>();
const emits = defineEmits(["update:visible"]);
const appStore = useApp();
let from: { x: number; y: number } = { x: 0, y: 0 };

const setPosition = (x, y) => {
  dialogRef.value.style.top = `${y}px`;
  dialogRef.value.style.left = `${x}px`;
};
watch(
  () => appStore.dialog.visible,
  (newVal) => {
    if (newVal) {
      from = { ...appStore.globlePosition };
      setPosition(appStore.globlePosition.x, appStore.globlePosition.y);
      setTimeout(() => {
        dialogRef.value.classList.remove("scale-0");
        dialogRef.value.classList.add(
          "transition-all",
          "duration-300",
          "opacity-100",
          "scale-100"
        );
        setPosition(window.innerWidth / 2, window.innerHeight / 2);
      }, 100);
    } else {
      dialogRef.value.classList.replace("scale-100", "scale-0");
      dialogRef.value.classList.replace("opacity-100", "opacity-0");
      setPosition(from.x, from.y);

      setTimeout(() => {
        dialogRef.value.classList.remove("transition-all", "duration-300");
      }, 300);
      from = { x: 0, y: 0 };
    }
  }
);
</script>
