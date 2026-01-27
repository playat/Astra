<template>
  <div class="text-white bg-neutral-800 flex items-center gap-3">
    <!-- 年 -->
    <NumItem :value="year" />
    <!-- - -->
    <!-- 月 -->
    <NumItem :value="month" />
    <!-- - -->
    <!-- 日 -->
    <NumItem :value="day" />
    <!-- <span class="w-4" /> -->
    <!-- 时 -->
    <NumItem :value="hours" />
    <!-- : -->
    <!-- 分 -->
    <NumItem :value="minutes" />
    <!-- : -->
    <!-- 秒 -->
    <NumItem :value="seconds" />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import NumItem from "./components/NumItem.vue";

defineProps<{
  value: any;
}>();

defineEmits(["update:value"]);

const year = ref();
const month = ref();
const day = ref();
const hours = ref();
const minutes = ref();
const seconds = ref();
onMounted(() => {
  const now = new Date();
  year.value = now.getFullYear();
  month.value = now.getMonth() + 1;
  day.value = now.getDate();
  hours.value = now.getHours();
  minutes.value = now.getMinutes();
  seconds.value = now.getSeconds();
});
</script>
