<template>
  <div
    class="text-gray-300 backdrop-blur-[20px] absolute top-1/4 left-1/2 -translate-x-1/2 rounded-full w-60 max-w-4/5 h-10 transition-[width background] flex items-center justify-center duration-300 bg-white/15 px-4 cursor-pointer"
    :class="{
      'w-xl bg-neutral-800!': searchStore.searchFocus || searchStore.searchText,
      'hover:w-xl hover:bg-neutral-800!': !searchStore.searchText && !searchStore.searchFocus,
      'opacity-0 invisible': appStore.isMore,
    }"
  >
    <div
      class="transform-[opacity] w-full flex items-center justify-between"
      :class="searchStore.searchFocus || searchStore.searchText ? 'opacity-100' : 'opacity-0'"
    >
      <YGSelect
        v-model="searchStore.searchFrom"
        :popper-style="{
          right: '40px',
          top: '50%',
          transform: 'translateY(-50%)'
        }"
        :options="searchStore.searchOptions"
      >
        <template #trigger="{ selected }">
          <img
            :src="searchStore.currentSearch.icon"
            class="w-5 h-5"
          />
        </template>
        <template #option="{ item }">
          <img :src="item.icon" class="w-4 h-4" />
          <span>{{ item.label }}</span>
        </template>
      </YGSelect>
      <input
        ref="inputRef"
        class="text-center flex-1 h-10 select-none placeholder:text-white placeholder:text-sm"
        @input="searchInput"
        @keydown.enter="searchStore.toSearch"
        @blur="toBlur"
        @focus="searchStore.searchFocus = true"
      />
      <img
        :src="SearchSvg"
        class="w-5 h-5 cursor-pointer"
        @click="searchStore.toSearch"
      />
    </div>
    <div
      class="text-sm absolute left-0 top-0 transition-opacity cursor-pointer flex items-center justify-center w-full h-full text-white whitespace-nowrap"
      :class="searchStore.searchFocus || searchStore.searchText ? 'opacity-0 pointer-events-none' : 'opacity-100 flex-1'"
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
import useApp from "@/store/app";
import useSearch from "@/store/search";
import YGSelect from "@/components_ui/YGSelect.vue";

const appStore = useApp();
const searchStore = useSearch();
const inputRef = ref();
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
        type: searchStore.searchFrom
      }).then((res: any) => {
        searchStore.suList = res.data;
      });
    }, 300);
  } else {
    searchStore.suList = [];
  }
};
const toBlur = () => {
  if(!searchStore.searchText) {
    searchStore.searchFocus = false
  }
}
const toFocus = () => {
  inputRef.value?.focus();
};

const handleGlobalKeyDown = (e: KeyboardEvent) => {
  if (
    e.ctrlKey ||
    e.metaKey ||
    e.altKey ||
    e.target instanceof HTMLInputElement ||
    e.target instanceof HTMLTextAreaElement
  ) {
    return;
  }

  if (/^[a-zA-Z0-9]$/.test(e.key)) {
    e.preventDefault();
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
