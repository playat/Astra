<template>
  <div class="text-white bg-neutral-800 flex items-center gap-3">
    <!-- 年 -->
    <NumItem v-model="year" :min="1900" :max="2100" />
    <!-- - -->
    <!-- 月 -->
    <NumItem v-model="month" :min="1" :max="12" />
    <!-- - -->
    <!-- 日 -->
    <NumItem v-model="day" :min="1" :max="31" />
    <!-- <span class="w-4" /> -->
    <!-- 时 -->
    <!-- <NumItem v-model="hours" :min="0" :max="23" /> -->
    <!-- : -->
    <!-- 分 -->
    <!-- <NumItem v-model="minutes" :min="0" :max="59" /> -->
    <!-- : -->
    <!-- 秒 -->
    <!-- <NumItem v-model="seconds" :min="0" :max="59" /> -->
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watch } from "vue";
import NumItem from "./components/NumItem.vue";

const props = defineProps<{
  modelValue: any;
}>();

const emits = defineEmits(["update:modelValue"]);

const year = ref();
const month = ref();
const day = ref();

// 监听各字段变化，组装成 Date 对象并传出
watch([year, month, day], () => {
  const date = `${year.value}-${month.value}-${day.value}`;
  emits("update:modelValue", date);
});

onMounted(() => {
  const now = props.modelValue ? new Date(props.modelValue) : new Date();
  year.value = now.getFullYear();
  month.value = now.getMonth() + 1;
  day.value = now.getDate();
});
</script>
