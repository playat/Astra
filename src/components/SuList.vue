<template>
  <div
    class="absolute top-1/4 mt-14 w-xl max-w-4/5 backdrop-blur-[20px] overflow-y-scroll max-h-[50vh] transition-all left-1/2 -translate-x-1/2 p-2 rounded-md bg-white/15 text-gray-300 scrollbar-none border border-white/10 shadow-xl z-50"
    :class="[
      searchStore.searchFocus && (searchStore.suList.length || searchStore.filteredApps.length) && !appStore.isMore
        ? 'visible opacity-100'
        : 'h-0 opacity-0 invisible',
    ]"
  >
    <!-- 搜索建议列表 -->
    <div
      v-for="(item, index) in searchStore.suList"
      :key="'su-' + item"
      class="text-sm cursor-pointer py-2 px-4 hover:bg-white/20 rounded-lg transition-all duration-200 active:scale-95 hover:text-white"
      :class="{ 'bg-white/20 text-white': activeIndex === index }"
      @click="search(item)"
      @mousedown.prevent
    >
      {{ item }}
    </div>
    <!-- 分隔线 -->
    <div
      v-if="searchStore.suList.length && searchStore.filteredApps.length"
      class="mx-4 my-1 border-t border-white/10"
    ></div>
    <!-- 前端匹配的应用列表 -->
    <div
      v-for="(app, appIndex) in searchStore.filteredApps"
      :key="'app-' + app.id"
      class="text-sm cursor-pointer py-2 px-4 hover:bg-white/20 rounded-lg transition-all duration-200 active:scale-95 hover:text-white flex items-center gap-3"
      :class="{ 'bg-white/20 text-white': activeIndex === searchStore.suList.length + appIndex }"
      @click="openApp(app)"
      @mousedown.prevent
    >
      <img
        :src="app.isDefault ? sysIcons[app.icon] : app.icon"
        class="w-5 h-5 rounded shrink-0 object-contain"
        referrerpolicy="no-referrer"
        @error="($event.target as HTMLImageElement).style.display = 'none'"
      />
      <span class="truncate">{{ app.name }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import useApp from "@/store/app";
import useSearch from "@/store/search";
import { sysIcons } from "@/config";
import { onMounted, onUnmounted, ref, watch } from "vue";

const appStore = useApp();
const searchStore = useSearch();

const search = (text: string) => {
  searchStore.searchText = text;
  searchStore.searchFocus = true;
  searchStore.toSearch();
};

const openApp = (app: any) => {
  searchStore.searchText = "";
  searchStore.suList = [];
  searchStore.searchFocus = false;
  appStore.openApp(app);
};

// 当前高亮索引
const activeIndex = ref(-1);

// 总列表长度
const totalLength = () => searchStore.suList.length + searchStore.filteredApps.length;

// 获取当前高亮项的文本（用于填充输入框）
const getHighlightText = (index: number) => {
  if (index < searchStore.suList.length) {
    return searchStore.suList[index];
  }
  const appIndex = index - searchStore.suList.length;
  return searchStore.filteredApps[appIndex]?.name || "";
};

// 监听列表变化，重置高亮索引
watch(
  () => [searchStore.suList, searchStore.filteredApps],
  () => {
    activeIndex.value = -1;
  }
);

// 监听键盘事件
const handleKeydown = (e: KeyboardEvent) => {
  const len = totalLength();
  if (!len || !searchStore.searchFocus) return;

  switch (e.key) {
    case "ArrowDown":
      e.preventDefault();
      activeIndex.value = (activeIndex.value + 1) % len;
      searchStore.searchText = getHighlightText(activeIndex.value);
      break;
    case "ArrowUp":
      e.preventDefault();
      activeIndex.value = (activeIndex.value - 1 + len) % len;
      searchStore.searchText = getHighlightText(activeIndex.value);
      break;
    case "Enter":
      e.preventDefault();
      if (activeIndex.value >= 0) {
        if (activeIndex.value < searchStore.suList.length) {
          search(searchStore.suList[activeIndex.value]);
        } else {
          const appIndex = activeIndex.value - searchStore.suList.length;
          openApp(searchStore.filteredApps[appIndex]);
        }
      } else if (searchStore.searchText) {
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
