<template>
  <div
    class="absolute top-1/4 mt-14 w-xl max-w-4/5 backdrop-blur-20px overflow-y-scroll max-h-[50vh] transition-all left-1/2 -translate-x-1/2 p-2 rounded-md bg-white/15 text-gray-300 scrollbar-none border border-white/10 shadow-xl"
    :class="[
      appStore.searchFocus && searchStore.suList.length && !appStore.isMore
        ? 'visible opacity-100'
        : 'h-0 opacity-0 invisible',
    ]"
  >
    <div
      v-for="(item, index) in searchStore.suList"
      :key="item"
      class="text-sm cursor-pointer py-2 px-4 hover:bg-white/20 rounded-lg transition-all duration-200 active:scale-95 hover:text-white"
      :class="{ 'bg-white/20 text-white': activeIndex === index }"
      @click="search(item)"
      @mousedown.prevent
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
  // 保持搜索框焦点状态
  appStore.searchFocus = true;
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
