<template>
  <div
    class="absolute z-30 left-0 top-0 w-full h-full bg-[rgba(0,0,0,0.2)] transition-all"
    :class="visible ? 'visible opacity-100' : 'opacity-0 invisible'"
    @click="emits('close')"
  >
    <div
      ref="dialogRef"
      @click.stop
      class="fixed min-w-[300px] max-w-11/12 bg-[var(--yg-bg-color)] p-3 rounded-md flex flex-col gap-3 overflow-hidden scale-0 -translate-x-1/2 -translate-y-1/2"
    >
      <div class="flex items-center justify-end">
        <img class="w-4 h-4 cursor-pointer" :src="CloseSvg" @click="hiddenFn" />
      </div>
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import CloseSvg from "@/assets/svg/close.svg";
import useApp from "@/store/app";
import { onMounted, ref } from "vue";

const emits = defineEmits(["close"]);

const dialogRef = ref<HTMLElement>();
const appStore = useApp();
let from: { x: number; y: number } = { x: 0, y: 0 };
const visible = ref(false);
const setPosition = (x, y) => {
  dialogRef.value.style.top = `${y}px`;
  dialogRef.value.style.left = `${x}px`;
};

const visibleFn = () => {
  visible.value = true;
  from = { ...appStore.globlePosition };
  setPosition(from.x, from.y);
  setTimeout(() => {
    dialogRef.value.classList.remove("scale-50");
    dialogRef.value.classList.add(
      "transition-all",
      "duration-300",
      "opacity-100",
      "scale-100"
    );
    setPosition(window.innerWidth / 2, window.innerHeight / 2);
  }, 100);
};

const hiddenFn = () => {
  visible.value = false;
  dialogRef.value.classList.replace("scale-100", "scale-50");
  dialogRef.value.classList.replace("opacity-100", "opacity-0");
  setPosition(from.x, from.y);
  setTimeout(() => {
    dialogRef.value.classList.remove("transition-all", "duration-300");
    emits("close");
  }, 300);
  from = { x: 0, y: 0 };
};

onMounted(visibleFn);
</script>
