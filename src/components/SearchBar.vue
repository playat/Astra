<template>
  <div
    class="bg-white-0.5 rounded-full py-2 px-4 w-1/8 hover:w-1/5 transition-all absolute z-10 left-1/2 top-1/8 -translate-x-1/2 backdrop-blur-md border border-gray-400"
    :class="inputFucos ? '!w-1/4' : 'w-1/8'"
  >
    <input
      class="w-full"
      @input="searchInput"
      v-model="searchText"
      @focus="inputFucos = true"
      @blur="inputFucos = false"
      @keydown.enter="toSearch(searchText)"
    />
    <div
      class="absolute top-[calc(100%+10px)] transition-all backdrop-blur-lg bg-white-0.5 left-0 w-full rounded-md"
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
import { ref } from "vue";

const searchFrom = ref('bing')
const suList = ref([]);
const searchText = ref("");
const inputFucos = ref(false);
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

const toSearch = (keyWord: string) => {
  window.open(`${searchApi[searchFrom.value]}${keyWord}`)
  searchText.value = ''
  suList.value = []
};
</script>
