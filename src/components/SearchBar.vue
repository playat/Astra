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
    >
      <img
        :src="BingSvg"
        class="w-5 h-5"
        :class="!appStore.searchFocus ? 'opacity-0' : 'opacity-100'"
      />
      <div class="relative flex-1 h-10">
        <input
          ref="inputRef"
          class="text-center absolute left-0 top-0 w-full h-full select-none placeholder:text-white placeholder:text-sm"
          :class="!appStore.searchFocus ? 'opacity-0' : 'opacity-100 flex-1'"
          @input="searchInput"
          v-model="searchStore.searchText"
          @keydown.enter="searchStore.toSearch"
        />

        <div
          class="text-sm absolute left-0 top-0 transition-[opacity] cursor-pointer flex items-center justify-center w-full h-full text-white whitespace-nowrap"
          :class="appStore.searchFocus ? 'opacity-0' : 'opacity-100 flex-1'"
          @click="toFocus"
        >
          搜索
        </div>
      </div>

      <img
        :src="SearchSvg"
        class="w-5 h-5"
        :class="!appStore.searchFocus ? 'opacity-0' : 'opacity-100'"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { suSearch } from "@/api/su";
import searchApi from "@/config";
import { onMounted, onUnmounted, ref } from "vue";
import SearchSvg from "@/assets/svg/search.svg";
import BingSvg from "@/assets/svg/bing.svg";
import useApp from "@/store/app";
import useSearch from "@/store/search";
const suList = ref<string[]>([]);
const appStore = useApp();
const searchStore = useSearch();
const inputRef = ref();
let timer: any;
const searchInput = (e) => {
  searchStore.searchText = e.target.value;
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  timer = setTimeout(async () => {
    const res = await suSearch({
      wd: e.target.value,
      cb: "SUJsonP",
    });
    searchStore.suList = res.data.s;
    clearTimeout(timer);
    timer = null;
  }, 100);
};
const toFocus = () => {
  appStore.searchFocus = true;
  inputRef.value.focus();
};

const handleKeydown = (e: KeyboardEvent) => {
  const isLetterOrNumber = /^[a-zA-Z0-9]$/.test(e.key);

  if (isLetterOrNumber && !appStore.searchFocus && !appStore.dialog.visible) {
    appStore.searchFocus = true;
    inputRef.value.focus();
  }
};

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
});
</script>
