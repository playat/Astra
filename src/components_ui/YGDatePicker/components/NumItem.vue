<template>
  <div
    class="transform-3d w-14 perspective-origin-center mx-auto relative h-[124px] select-none"
    @mousedown="mouseDown"
    @touchstart="mouseDown"
    @wheel="handleWheel"
    :style="{
      transform: `rotateX(${rotateX}deg)`,
      transition: isDragging ? 'none' : '0.3s ease-out',
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
import { computed, onMounted, onUnmounted, ref, watch } from "vue";

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
const rotateX = ref(0);

// 记录上一次的 45 度步进值
let lastStep = 0;
watch(rotateX, (val) => {
  const currentStep = Math.floor(val / 45);
  if (currentStep !== lastStep) {
    const direction = currentStep > lastStep ? "顺时针" : "逆时针";
    // 计算当前显示的数字
    // 顺时针（currentStep 增加）数值增加，逆时针（currentStep 减少）数值减少
    const offset = Math.round(val / 45);
    const currentValue = (props.value || 0) + offset;
    console.log(`旋转45度，方向：${direction}，当前数字：${currentValue}`);
    lastStep = currentStep;
  }
});

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
};

const mouseUp = () => {
  isDragging.value = false;
  // 自动吸附到最近的 45 度倍数
  rotateX.value = Math.round(rotateX.value / 45) * 45;
};

// 处理鼠标滚轮
const handleWheel = (e: WheelEvent) => {
  e.preventDefault();
  // 向上滚动 e.deltaY < 0，数值增加（rotateX 增加）
  // 向下滚动 e.deltaY > 0，数值减少（rotateX 减少）
  const direction = e.deltaY < 0 ? 1 : -1;
  rotateX.value += direction * 45;
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
