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
  inputRef.value.focus();
};
// 标记是否处于中文输入法组合输入状态
const isComposing = ref(false);
// 标记输入框是否已聚焦（避免重复聚焦）
const isInputFocused = ref(false);

// 处理全局键盘按下事件
const handleGlobalKeyDown = (e) => {
  // 1. 中文输入法激活时，不处理任何逻辑（交给输入法原生处理）
  if (isComposing.value) return;

  // 2. 过滤：只处理字母/数字键，排除功能键
  const key = e.key;
  const isLetterOrNumber = /^[a-zA-Z0-9]$/.test(key);
  const excludeKeys = [
    "Shift",
    "Ctrl",
    "Alt",
    "Meta",
    "Tab",
    "Enter",
    "Backspace",
    "Delete",
    "ArrowUp",
    "ArrowDown",
    "ArrowLeft",
    "ArrowRight",
  ];

  // 3. 只在「非聚焦状态 + 有效字符」时触发聚焦
  if (
    isLetterOrNumber &&
    !excludeKeys.includes(key) &&
    !isInputFocused.value &&
    inputRef.value
  ) {
    // 聚焦到输入框（输入法会自动捕获后续输入）
    inputRef.value.focus();
    // 阻止事件冒泡（避免触发其他全局监听）
    e.stopPropagation();
  }
};

// 输入法组合开始（中文输入法激活，比如输入拼音时）
const handleCompositionStart = () => {
  isComposing.value = true;
};

// 输入法组合结束（中文输入完成/取消，比如选字后按空格）
const handleCompositionEnd = (e) => {
  isComposing.value = false;
  // 确保输入框始终处于聚焦状态，文本正确录入
  if (inputRef.value && !isInputFocused.value) {
    inputRef.value.focus();
  }
};
// 挂载时注册全局事件
onMounted(() => {
  // 注册全局键盘监听（捕获阶段触发，确保优先处理）
  document.addEventListener("keydown", handleGlobalKeyDown, true);
  document.addEventListener("compositionstart", handleCompositionStart);
  document.addEventListener("compositionend", handleCompositionEnd);
});

// 卸载时销毁全局事件（避免内存泄漏）
onUnmounted(() => {
  document.removeEventListener("keydown", handleGlobalKeyDown, true);
  document.removeEventListener("compositionstart", handleCompositionStart);
  document.removeEventListener("compositionend", handleCompositionEnd);
});
</script>
