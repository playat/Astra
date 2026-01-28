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
      :key="index"
      class="h-[50px] w-full absolute flex items-center bg-gray-600 top-1/2 -translate-y-1/2 transition-all justify-center border-white border-y"
      :style="{
        transform: `rotateX(${135 - index * 45}deg) translateZ(62px)`,
      }"
    >
      {{ item.value }}
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";

const props = defineProps<{
  modelValue?: number;
  max?: number;
  min?: number;
}>();
const emit = defineEmits<{
  (e: "update:modelValue", value: number): void;
}>();
// 配置参数
const config = {
  sensitivity: 0.6, // 旋转灵敏度
};
// 取出 modelValue 作为初始值
let initialValue = 0;

const isInitialized = ref(false);
const numList = computed(() => {
  if (!isInitialized.value) return [];
  return Array.from({ length: 8 }).map((_, index) => {
    // 基础偏移：index 3 是 0，index 0 是 -3
    const baseOffset = index - 3;
    // 计算圈数 k
    // 角度：rotateX + 初始角度 (135 - index * 45)
    // 初始角度：index 0 -> 135, index 3 -> 0
    const angle = rotateX.value + 135 - index * 45;
    // 偏移 180 度是为了让背面切换
    const k = Math.floor((angle + 180) / 360);
    return {
      value: initialValue + baseOffset + k * 8,
      index,
    };
  });
});

const stopWatch = watch(
  () => props.modelValue,
  (val) => {
    if (val !== undefined && val !== null) {
      initialValue = val;
      isInitialized.value = true;
      stopWatch();
    }
  },
  { immediate: true },
);
let lastMouseY = 0;
const rotateX = ref(0);

watch(rotateX, (val) => {
  if (isInitialized.value) {
    const currentFrontVal = initialValue + Math.round(val / 45);
    emit("update:modelValue", currentFrontVal);
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
  // 根据拖拽方向判断是否已达边界，若已达边界则阻止继续拖动
  if (
    (props.min !== undefined && deltaY > 0 && props.modelValue <= props.min) ||
    (props.max !== undefined && deltaY < 0 && props.modelValue >= props.max)
  )
    return;
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
  // 根据拖拽方向判断是否已达边界，若已达边界则阻止继续拖动
  if (
    (props.min !== undefined &&
      e.deltaY < 0 &&
      props.modelValue <= props.min) ||
    (props.max !== undefined && e.deltaY > 0 && props.modelValue >= props.max)
  )
    return;
  // 向上滚动 e.deltaY < 0，数值增加（rotateX 减少）
  // 向下滚动 e.deltaY > 0，数值减少（rotateX 滚动）
  const direction = e.deltaY < 0 ? -1 : 1;
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
