<template>
  <div class="mx-auto mt-[calc(100vh/8)] left-1/2 w-max">
    <div
      class="text-gray-300 relative rounded-full w-40 h-10 transition-[width] flex items-center justify-center hover:w-xl duration-300 bg-white-0.15 px-4 cursor-pointer"
      style="backdrop-filter: blur(6px)"
      :class="{ 'w-xl': focus }"
    >
      <input
        ref="inputRef"
        class="text-center transform-[opacity] w-full px-4 absolute left-0 top-0 h-10 delay-300"
        :class="!focus ? 'opacity-0' : 'opacity-100'"
        @input="searchInput"
        v-model="searchText"
        @blur="toBlur"
        @focus="toFocus"
        @keydown.enter="toSearch(searchText)"
      />
      <img
        :src="SearchSvg"
        class="transition-[opacity] mx-auto w-5 h-5"
        :class="focus ? 'opacity-0' : 'opacity-100'"
      />
    </div>

    <div
      class="top-full mt-4 transition-all w-full rounded-md bg-white-0.15 text-gray-300"
      style="backdrop-filter: blur(6px)"
      :class="{
        'invisible opacity-0': !focus,
      }"
    >
      <div
        v-for="item in suList"
        :key="item"
        class="text-sm cursor-pointer py-2 px-4"
        @click="toSearch(item)"
      >
        {{ item }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { suSearch } from "@/api/su";
import searchApi from "@/config";
import { ref, nextTick } from "vue";
import SearchSvg from "@/assets/svg/search.svg";
const searchFrom = ref("bing");
const suList = ref<string[]>([]);
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

const toBlur = () => {
  focus.value = false;
  searchText.value = "";
};

const toSearch = (keyWord: string) => {
  window.open(`${searchApi[searchFrom.value]}${keyWord}`);
  searchText.value = "";
  suList.value = [];
};
</script>
