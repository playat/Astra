import searchApi from "@/config/index.js";
import { defineStore } from "pinia";
import { ref, computed } from "vue";
import useApp from "./app.js";

const useSearch = defineStore("search", () => {
  const searchFocus = ref(false);
  const suList = ref<string[]>([]);
  const searchFrom = ref<keyof typeof searchApi>("edge");
  const searchText = ref("");

  const filteredApps = computed(() => {
    const query = searchText.value.trim().toLowerCase();
    if (!query) return [];
    const appStore = useApp();
    return appStore.apps.filter((app) =>
      app.name.toLowerCase().includes(query)
    );
  });

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
    searchFocus.value = false;
  };

  return {
    suList,
    toSearch,
    searchText,
    searchFrom,
    searchOptions,
    currentSearch,
    searchFocus,
    filteredApps,
  };
});

export default useSearch;
