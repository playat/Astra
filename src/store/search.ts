import searchApi from "@/config/index.js";
import { defineStore } from "pinia";
import { ref } from "vue";
import useApp from "./app.js";

const useSearch = defineStore("search", () => {
  const appStore = useApp();

  const suList = ref<string[]>([]);
  const searchFrom = ref("bing");
  const searchText = ref("");

  const toSearch = () => {
    window.open(`${searchApi[searchFrom.value]}${searchText.value}`);
    searchText.value = "";
    suList.value = [];
    appStore.searchFocus = false;
  };
  return {
    suList,
    toSearch,
    searchText,
    searchFrom
  };
});

export default useSearch;
