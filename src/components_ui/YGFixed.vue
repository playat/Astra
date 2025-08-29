<template>
  <div
    class="fixed bg-gray-400 h-96 w-96"
    :style="{
      top: `${top}px`,
      left: `${left}px`,
    }"
    @mousedown="mousedown"
    @mousemove="mousemove"
    @mouseup="mouseUp"
    ref="fixedRef"
  >
    <slot />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";

const fixedRef = ref<HTMLElement>();

const isDown = ref(false);
const top = ref(0);
const left = ref(0);
let baseClientX = 0;
let baseClientY = 0;
let baseRect: DOMRect = {
  height: 0,
  width: 0,
  x: 0,
  y: 0,
  bottom: 0,
  left: 0,
  right: 0,
  top: 0,
  toJSON: function () {
    throw new Error("Function not implemented.");
  },
};
const rect = {
  width: 0,
  height: 0,
};
const mousedown = (e: MouseEvent) => {
  isDown.value = true;
  baseRect = fixedRef.value.getBoundingClientRect();
  console.log(baseRect);

  baseClientX = e.clientX;
  baseClientY = e.clientY;
  
};
const mousemove = (e: MouseEvent) => {
  if (isDown.value) {
    const lastX = baseRect.top + (e.clientX - baseClientX);
    const lastY = baseRect.left + (e.clientY - baseClientY);

    // if (lastY > 0 && lastY <= rect.height) {
    top.value = lastY;
    // }
    // if (lastX > 0 && lastX <= rect.width) {
    left.value = lastX;
    // }
  }
};

const mouseUp = (e: MouseEvent) => {
  isDown.value = false;
};

onMounted(() => {
  const fixedRect = fixedRef.value.getBoundingClientRect();

  rect.width = window.innerWidth - fixedRect.width;
  rect.height = window.innerHeight - fixedRect.height;
});
</script>
