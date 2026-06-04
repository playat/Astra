import searchApi from "@/config/index.js";
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import useApp from "./app.js";

const useSearch = defineStore("search", () => {
  const appStore = useApp();

  const suList = ref<string[]>([]);
  const searchFrom = ref<keyof typeof searchApi>("edge");
  const searchText = ref("");

  const searchOptions = computed(() =>
    Object.entries(searchApi).map(([key, value]) => ({
      value: key,
      label: value.label,
      icon: value.icon,
    }))
  );

  const currentSearch = computed(() => searchApi[searchFrom.value]);

  const toSearch = () => {
    const query = searchText.value.trim();

    if (!query) {
      window.open(currentSearch.value.url);
    } else {
      window.open(`${currentSearch.value.url}${query}`);
    }

    searchText.value = "";
    suList.value = [];
    appStore.searchFocus = false;
  };

  return {
    suList,
    toSearch,
    searchText,
    searchFrom,
    searchOptions,
    currentSearch,
  };
});

export default useSearch;
