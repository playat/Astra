<template>
  <div
    class="absolute top-1/4 mt-14 w-xl max-w-4/5 backdrop-blur-20px overflow-y-scroll max-h-[50vh] transition-all left-1/2 -translate-x-1/2 p-2 rounded-md bg-white-0.15 text-gray-300 scrollbar-none"
    :class="[
      appStore.searchFocus && searchStore.suList.length && !appStore.isMore
        ? 'visible'
        : 'h-0 opacity-0 invisible',
    ]"
  >
    <div
      v-for="(item, index) in searchStore.suList"
      :key="item"
      class="text-sm cursor-pointer py-1.5 px-4 hover:bg-white-0.15 rounded-lg transition-all"
      :class="{ 'bg-white-0.15': activeIndex === index }"
      @click="search(item)"
    >
      {{ item }}
    </div>
  </div>
</template>

<script setup lang="ts">
import useApp from "@/store/app";
import useSearch from "@/store/search";
import { onMounted, onUnmounted, ref, watch } from "vue";

const appStore = useApp();
const searchStore = useSearch();
const search = (text: string) => {
  searchStore.searchText = text;
  searchStore.toSearch();
};

// 当前高亮索引
const activeIndex = ref(-1);

// 监听列表变化，重置高亮索引
watch(
  () => searchStore.suList,
  () => {
    activeIndex.value = -1;
  }
);

// 监听键盘事件
const handleKeydown = (e: KeyboardEvent) => {
  const len = searchStore.suList.length;
  // 只有当搜索建议列表显示且应用处于搜索聚焦状态时才处理
  if (!len || !appStore.searchFocus) return;

  switch (e.key) {
    case "ArrowDown":
      e.preventDefault();
      activeIndex.value = (activeIndex.value + 1) % len;
      // 填充到输入框
      searchStore.searchText = searchStore.suList[activeIndex.value];
      break;
    case "ArrowUp":
      e.preventDefault();
      activeIndex.value = (activeIndex.value - 1 + len) % len;
      // 填充到输入框
      searchStore.searchText = searchStore.suList[activeIndex.value];
      break;
    case "Enter":
      e.preventDefault();
      if (activeIndex.value >= 0) {
        search(searchStore.suList[activeIndex.value]);
      } else if (searchStore.searchText) {
        // 如果没有选中项，但输入框有内容，直接搜索输入框的内容
        searchStore.toSearch();
      }
      break;
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
});

</script>
