<template>
  <div
    class="transform-3d w-14 perspective-origin-center mx-auto relative h-[124px] select-none"
    @mousedown="mouseDown"
    @touchstart="mouseDown"
    :style="{
      transform: `rotateX(${rotateX}deg)`,
      transition: `0.1s ease-out`,
    }"
  >
    <div
      v-for="(item, index) in numList"
      :key="item"
      class="h-[50px] w-full absolute flex items-center bg-gray-600 top-1/2 -translate-y-1/2 transition-all justify-center border-white border-y"
      :style="{
        transform: `rotateX(${135 - index * 45}deg) translateZ(62px)`,
      }"
    >
      {{ item }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue";

const props = defineProps<{
  value?: number;
}>();
// 配置参数
const config = {
  sensitivity: 0.6, // 旋转灵敏度
};
const numList = computed(() => {
  return [
    props.value - 3,
    props.value - 2,
    props.value - 1,
    props.value,
    props.value + 1,
    props.value + 2,
    props.value + 3,
    props.value + 4,
  ];
});
let lastMouseY = 0;
let upIndex = 0;
let downIndex = 7;
const rotateX = ref(0);

const isDragging = ref<boolean>(false);

const mouseDown = (e: TouchEvent & MouseEvent) => {
  isDragging.value = true;
  lastMouseY = e.touches ? e.touches[0].clientY : e.clientY;
};

const mouseMove = (e: TouchEvent & MouseEvent) => {
  if (!isDragging.value) return;
  const clientY = e.touches ? e.touches[0].clientY : e.clientY;
  const deltaY = clientY - lastMouseY;
  rotateX.value -= deltaY * config.sensitivity;
  lastMouseY = clientY;
  // 向上还是向下：根据 deltaY 正负判断滑动方向
  // 每累计移动45度打印一次
  // 每 45° 为一个“刻度步长”，用于判断用户是否滑过了一个数字位
  const step = 45;
  // 根据当前 rotateX 值，四舍五入到最接近的刻度步数
  const currentStep = Math.round(rotateX.value / step);
  // 计算“上一次”所在的刻度步数，用于与 currentStep 比较是否跨步
  const lastStep = Math.round(
    (rotateX.value - deltaY * config.sensitivity) / step
  );
  if (currentStep !== lastStep) {
    if (deltaY < 0) {
      // 向上滑动
      numList.value[upIndex] = numList.value[7] + 1 + upIndex;
      upIndex++;
      if (upIndex > 7) upIndex = 0;
    } else if (deltaY > 0) {
      // 向下滑动时，把即将出现的底部数字设为当前最小值再减 1，保持连续递减
      numList.value[downIndex] = numList.value[0] - 1 - (7 - downIndex);
      downIndex--;
      if (downIndex < 0) downIndex = 7;
    }
  }
};

const mouseUp = () => {
  isDragging.value = false;
};

// 生命周期：挂载时绑定全局事件
onMounted(() => {
  document.addEventListener("mousemove", mouseMove);
  document.addEventListener("mouseup", mouseUp);
  document.addEventListener("touchmove", mouseMove);
  document.addEventListener("touchend", mouseUp);
});

// 生命周期：卸载时解绑全局事件（防止内存泄漏）
onUnmounted(() => {
  document.removeEventListener("mousemove", mouseMove);
  document.removeEventListener("mouseup", mouseUp);
  document.removeEventListener("touchmove", mouseMove);
  document.removeEventListener("touchend", mouseUp);
});
</script>

<style>
/* style="animation: rotateXLoop 20s linear infinite" */

@keyframes rotateXLoop {
  0% {
    transform: rotateX(0deg);
  }
  100% {
    transform: rotateX(360deg);
  }
}
</style>
