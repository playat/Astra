<template>
  <div class="absolute left-1/2 top-[calc(100vh/4-58px)] -translate-x-1/2 text-white text-5xl">
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
const updateTime = () => {
  seconds.value++;
  if (seconds.value >= 60) {
    seconds.value = 0;
    minutes.value++;
    if (minutes.value >= 60) {
      minutes.value = 0;
      hours.value++;
      if (hours.value >= 24) {
        hours.value = 0;
      }
    }
  }
};
// 组件挂载时启动计时器
onMounted(() => {
  const now = new Date();
  hours.value = now.getHours();
  minutes.value = now.getMinutes();
  seconds.value = now.getSeconds();
  timer = setInterval(updateTime, 1000);
});

// 组件卸载时清除计时器
onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
});
</script>
