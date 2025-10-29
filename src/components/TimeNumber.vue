<template>
  <div
    class="absolute z-20 left-1/2 top-[calc(100vh/4-58px)] -translate-x-1/2 text-white text-5xl select-none"
  >
    {{ timeDisplay }}
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from "vue";

// 时间数据
const hours = ref(0);
const minutes = ref(0);
const seconds = ref(0);

// 定时器
let timer: any = null;

// 格式化数字为两位
const formatNumber = (num: number): string => {
  return num.toString().padStart(2, "0");
};

// 计算时间显示
const timeDisplay = computed(() => {
  return `${formatNumber(hours.value)}:${formatNumber(
    minutes.value
  )}:${formatNumber(seconds.value)}`;
});

// 更新时间
let lastSecond = -1;
const updateTime = () => {
  const now = new Date();
  const currentSecond = now.getSeconds();
  if (currentSecond !== lastSecond) {
    // 只有秒数变化时才更新
    hours.value = now.getHours();
    minutes.value = now.getMinutes();
    seconds.value = currentSecond;
    lastSecond = currentSecond;
  }

  requestAnimationFrame(updateTime);
};
// 组件挂载时启动计时器
onMounted(() => {
  updateTime();
});

// 组件卸载时清除计时器
onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
});
</script>
