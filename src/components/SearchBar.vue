<template>
  <div class="absolute top-1/8 left-1/2 w-max -translate-x-1/2 transition-all">
    <div
      class="text-gray-300 rounded-full w-[10vw] h-10 hover:w-[20vw] transition-all duration-300 flex justify-center items-center bg-white-0.15 px-4 cursor-pointer"
      style="backdrop-filter: blur(6px)"
      :class="{ 'w-[20vw]': focus }"
      @click="toFocus"
    >
      <input
        ref="inputRef"
        v-show="focus"
        class="flex-1 text-center"
        @input="searchInput"
        v-model="searchText"
        @blur="toBlur"
        @keydown.enter="toSearch(searchText)"
      />
      <img
        :src="SearchSvg"
        v-show="!focus"
        class="transition-all"
        :class="{ 'opacity-0 invisible': focus }"
      />
    </div>

    <div
      class="absolute top-full mt-4 transition-all w-full rounded-md bg-white-0.15 text-gray-300"
      style="backdrop-filter: blur(6px)"
      :class="{
        'invisible opacity-0': !inputFucos,
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
    suList.value = res.s;
    clearTimeout(timer);
    timer = null;
  }, 100);
};

const toFocus = () => {
  focus.value = !focus.value;
  nextTick(() => {
    inputRef.value.focus();
  });
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
