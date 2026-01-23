<template>
  <div
    class="text-gray-300 backdrop-blur-20px absolute top-1/4 left-1/2 -translate-x-1/2 rounded-full w-60 max-w-4/5 h-10 transition-[width background] flex items-center justify-center hover:w-xl hover:!bg-neutral-800 duration-300 bg-white-0.15 px-4 cursor-pointer"
    :class="{
      'w-xl !bg-neutral-800': appStore.searchFocus,
      'opacity-0 invisible': appStore.isMore,
    }"
  >
    <div
      class="transform-[opacity] w-full flex items-center justify-between delay-200"
      :class="!appStore.searchFocus ? 'opacity-0' : 'opacity-100'"
    >
      <img :src="BingSvg" class="w-5 h-5" />
      <input
        ref="inputRef"
        class="text-center absolute left-0 top-0 flex-1 h-10 w-full select-none placeholder:text-white placeholder:text-sm"
        @input="searchInput"
        @blur="searchBlur"
        v-model="searchStore.searchText"
        @keydown.enter="searchStore.toSearch"
      />
      <img
        :src="SearchSvg"
        class="w-5 h-5 cursor-pointer"
        @click="searchStore.toSearch"
      />
    </div>

    <div
      class="text-sm absolute left-0 top-0 transition-[opacity] cursor-pointer flex items-center justify-center w-full h-full text-white whitespace-nowrap"
      :class="appStore.searchFocus ? 'opacity-0' : 'opacity-100 flex-1'"
      @click="toFocus"
    >
      搜索
    </div>
  </div>
</template>

<script setup lang="ts">
import { suSearch } from "@/api/su";
import { onMounted, onUnmounted, ref } from "vue";
import SearchSvg from "@/assets/svg/search.svg";
import BingSvg from "@/assets/svg/bing.svg";
import useApp from "@/store/app";
import useSearch from "@/store/search";
const appStore = useApp();
const searchStore = useSearch();
const inputRef = ref();
const isLook = ref(false);
let timer: any;
const searchInput = (e: any) => {
  const value = e.target.value;
  searchStore.searchText = value;
  if (timer) {
    clearTimeout(timer);
  }
  if (value) {
    timer = setTimeout(() => {
      suSearch({
        wd: value,
        cb: "SUJsonP",
      }).then((res: any) => {
        searchStore.suList = res.data.s;
      });
    }, 300);
  } else {
    searchStore.suList = [];
  }
};
const searchBlur = () => {
  appStore.searchFocus = false;
  searchStore.searchText = "";
  searchStore.suList = [];
};

const toFocus = () => {
  appStore.searchFocus = true;
  inputRef.value?.focus();
};

// 全局键盘监听
const handleGlobalKeyDown = (e: KeyboardEvent) => {
  // 如果当前已聚焦输入框，或按下的是功能组合键，则不处理
  if (
    appStore.searchFocus ||
    e.ctrlKey ||
    e.metaKey ||
    e.altKey ||
    e.target instanceof HTMLInputElement ||
    e.target instanceof HTMLTextAreaElement
  ) {
    return;
  }

  // 仅处理字母和数字
  if (/^[a-zA-Z0-9]$/.test(e.key)) {
    e.preventDefault(); // 阻止第一个字符录入，解决中文输入法首字母问题
    toFocus();
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleGlobalKeyDown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleGlobalKeyDown);
});
</script>
