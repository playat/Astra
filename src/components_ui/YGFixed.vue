<template>
  <div
    class="absolute z-20 left-0 top-0 w-full h-full bg-[rgba(0,0,0,0.2)] transition-all"
    :class="visible ? 'visible opacity-100' : 'opacity-0 invisible'"
    @mousemove="mousemove"
  >
    <div
      class="absolute bg-black-0.5 rounded-md z-[9999]"
      :style="{
        top: `${top}px`,
        left: `${left}px`,
      }"
      ref="fixedRef"
    >
      <div
        class="h-5 border-b px-1 cursor-move flex items-center select-none"
        @mousedown="mousedown"
        @mouseup="mouseUp"
      >
        <img :src="MoveSvg" alt="" class="w-3 h-3" />
      </div>
      <div class="p-3">
        <component :is="component" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from "vue";
import { visible, component } from "@/hooks/useFixed";
import MoveSvg from "@/assets/svg/move.svg";
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
