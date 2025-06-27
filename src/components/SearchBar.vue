<template>
  <div
    class="text-gray-300 backdrop-blur-6px absolute top-1/8 left-1/2 -translate-x-1/2 rounded-full w-40 h-10 transition-[width background] flex items-center justify-center hover:w-xl hover:!bg-neutral-800 duration-300 bg-white-0.15 px-4 cursor-pointer"
    :class="{ 'w-xl !bg-neutral-800': appStore.searchFocus }"
  >
    <div
      class="transform-[opacity] w-full flex items-center px-4 delay-200"
      tabindex="0"
    >
      <img
        @click.stop="selectSearch"
        :src="BingSvg"
        class="w-5 h-5"
        :class="!appStore.searchFocus ? 'opacity-0' : 'opacity-100'"
      />
      <div
        class="text-sm transition-[opacity] cursor-pointer flex items-center justify-center w-full h-10 text-white whitespace-nowrap"
        :class="
          appStore.searchFocus ? 'opacity-0' : 'opacity-100 flex-1'
        "
        @click="toFocus"
      >
        搜索
      </div>
      <input
        ref="inputRef"
        class="text-center h-10 select-none"
        :class="
          !appStore.searchFocus ? 'opacity-0' : 'opacity-100 flex-1'
        "
        @input="searchInput"
        v-model="searchText"
        @keydown.enter="toSearch(searchText)"
      />
      <img
        :src="SearchSvg"
        class="mx-auto w-5 h-5"
        :class="!appStore.searchFocus ? 'opacity-0' : 'opacity-100'"
      />
    </div>
  </div>

  <div
    class="mt-4 absolute top-1/5 w-xl backdrop-blur-6px overflow-y-scroll transition-all left-1/2 -translate-x-1/2 p-2 rounded-md bg-white-0.15 text-gray-300 scrollbar-none"
    :class="appStore.searchFocus ? 'h-[50vh]' : 'h-0 opacity-0'"
  >
    <div
      v-for="item in suList"
      :key="item"
      class="text-sm cursor-pointer py-2 px-4 hover:bg-white-0.15 rounded-lg"
      @click="toSearch(item)"
    >
      {{ item }}
    </div>
  </div>
  <!-- </div> -->
</template>

<script setup lang="ts">
import { suSearch } from "@/api/su";
import searchApi from "@/config";
import { onMounted, onUnmounted, ref } from "vue";
import SearchSvg from "@/assets/svg/search.svg";
import BingSvg from "@/assets/svg/bing.svg";
import useApp from "@/store/app";
const searchFrom = ref("bing");
const suList = ref<string[]>([
  "小米",
  "xiaomi",
  "小米",
  "xiaomi",
  "小米",
  "xiaomi",
  "小米",
  "xiaomi",
  "小米",
  "xiaomi",
]);
const appStore = useApp();
const searchText = ref("");
const inputRef = ref();
let timer: any;
const searchInput = (e) => {
  searchText.value = e.target.value;
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  timer = setTimeout(async () => {
    const res = await suSearch({
      wd: e.target.value,
      cb: "SUJsonP",
    });
    console.log(res);

    suList.value = res.s;
    clearTimeout(timer);
    timer = null;
  }, 100);
};
const toFocus = () => {
  appStore.searchFocus = true;
  inputRef.value.focus();
};
const selectSearch = () => {};

const toSearch = (keyWord: string) => {
  window.open(`${searchApi[searchFrom.value]}${keyWord}`);
  searchText.value = "";
  suList.value = [];
};

// const handleKeydown = (e: KeyboardEvent) => {
//   const isLetterOrNumber = /^[a-zA-Z0-9]$/.test(e.key);

//   if (isLetterOrNumber && !appStore.searchFocus) {
//     appStore.searchFocus = true;
//     inputRef.value.focus();
//   }
// };

// onMounted(() => {
//   window.addEventListener("keydown", handleKeydown);
// });

// onUnmounted(() => {
//   window.removeEventListener("keydown", handleKeydown);
// });
</script>
