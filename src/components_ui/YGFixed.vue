<template>
  <div
    v-if="visible"
    class="fixed bg-gray-400 rounded-md z-[9999]"
    :style="{
      top: `${top}px`,
      left: `${left}px`,
    }"
    @mousemove="mousemove"
    ref="fixedRef"
  >
    <div
      class="h-5 border-b p-3 cursor-move"
      @mousedown="mousedown"
      @mouseup="mouseUp"
    ></div>
    <div class="p-3">
      <component :is="component" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from "vue";
import { visible, component } from "@/hooks/useFixed";
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

  baseClientX = e.clientX;
  baseClientY = e.clientY;
};
const mousemove = (e: MouseEvent) => {
  if (isDown.value) {
    const lastX = baseRect.left + (e.clientX - baseClientX);
    const lastY = baseRect.top + (e.clientY - baseClientY);
    if (lastY < 0) {
      top.value = 0;
    } else if (lastY > rect.height) {
      top.value = rect.height;
    } else {
      top.value = lastY;
    }

    if (lastX < 0) {
      left.value = 0;
    } else if (lastX > rect.width) {
      left.value = rect.width;
    } else {
      left.value = lastX;
    }
  }
};

const mouseUp = (e: MouseEvent) => {
  isDown.value = false;
};

watch(visible, (newVal) => {
  if (newVal) {
    nextTick(() => {
      const fixedRect = fixedRef.value.getBoundingClientRect();
      rect.width = window.innerWidth - fixedRect.width;
      rect.height = window.innerHeight - fixedRect.height;
    });
  }
});
</script>
