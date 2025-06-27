<template>
  <div
    class="text-gray-300 backdrop-blur-6px absolute top-1/8 left-1/2 -translate-x-1/2 rounded-full w-40 h-10 transition-[width background] flex items-center justify-center hover:w-xl hover:!bg-neutral-800 duration-300 bg-white-0.15 px-4 cursor-pointer"
    :class="{ 'w-xl !bg-neutral-800': focus }"
  >
    <div
      class="transform-[opacity] w-full flex items-center px-4 absolute left-0 top-0 delay-200"
      :class="!focus ? 'opacity-0' : 'opacity-100'"
      tabindex="0"
    >
      <img @click="selectSearch" :src="BingSvg" class="w-5 h-5" />
      <input
        ref="inputRef"
        class="text-center h-10 flex-1"
        @input="searchInput"
        @focus="toFocus"
        @blur="toFocus"
        v-model="searchText"
        @keydown.enter="toSearch(searchText)"
      />
      <img :src="SearchSvg" class="mx-auto w-5 h-5" />
    </div>
    <span
      class="text-sm transition-[opacity]"
      :class="focus ? 'opacity-0' : 'opacity-100'"
    >
      搜索
    </span>
    <!-- <img
        :src="SearchSvg"
        class="transition-[opacity] mx-auto w-5 h-5"
        :class="focus ? 'opacity-0' : 'opacity-100'"
      /> -->
  </div>

  <div
    class="mt-4 absolute top-1/5 w-xl backdrop-blur-6px overflow-y-scroll transition-all left-1/2 -translate-x-1/2 p-2 rounded-md bg-white-0.15 text-gray-300 scrollbar-none"
    :class="focus ? 'h-[50vh]' : 'h-0 opacity-0'"
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
const searchText = ref("");
const inputFucos = ref(false);
const focus = ref(false);
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
  focus.value = !focus.value;
};

const selectSearch = () => {};

const toSearch = (keyWord: string) => {
  window.open(`${searchApi[searchFrom.value]}${keyWord}`);
  searchText.value = "";
  suList.value = [];
};

const handleKeydown = (e: KeyboardEvent) => {
  const isLetterOrNumber = /^[a-zA-Z0-9]$/.test(e.key);

  if (isLetterOrNumber && !focus.value) {
    focus.value = true;
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
