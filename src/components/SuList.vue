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
      v-for="item in searchStore.suList"
      :key="item"
      class="text-sm cursor-pointer py-1.5 px-4 hover:bg-white-0.15 rounded-lg transition-all"
      @click="search(item)"
    >
      {{ item }}
    </div>
  </div>
</template>

<script setup lang="ts">
import useApp from "@/store/app";
import useSearch from "@/store/search";
import { onMounted, onUnmounted, ref } from "vue";

const appStore = useApp();
const searchStore = useSearch();
const search = (text: string) => {
  searchStore.searchText = text;
  searchStore.toSearch();
};

// 当前高亮索引
const activeIndex = ref(-1);

// 监听键盘事件
const handleKeydown = (e: KeyboardEvent) => {
  const len = searchStore.suList.length;
  if (!len) return;

  switch (e.key) {
    case "ArrowDown":
      e.preventDefault();
      activeIndex.value = (activeIndex.value + 1) % len;
      break;
    case "ArrowUp":
      e.preventDefault();
      activeIndex.value = (activeIndex.value - 1 + len) % len;
      break;
    case "Enter":
      e.preventDefault();
      if (activeIndex.value >= 0) {
        search(searchStore.suList[activeIndex.value]);
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
