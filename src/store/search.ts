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
    const query = searchText.value.trim();
    
    if (!query) {
      // 如果没有搜索文本，直接跳转到搜索引擎主页
      window.open(searchApi[searchFrom.value]);
    } else {
      // 如果有搜索文本，则进行搜索
      window.open(`${searchApi[searchFrom.value]}${query}`);
    }
    
    // 清理搜索状态
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
