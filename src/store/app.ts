import { getItem } from "@/utils/indexedDb.js";
import { defineStore } from "pinia";
import { reactive, ref } from "vue";

const useApp = defineStore("app", () => {
  const bgCfn = reactive<{
    url: string;
    type: "image" | "video" | undefined;
  }>({
    url: "",
    type: undefined,
  });

  const searchFocus = ref(false);

  const apps = ref<
    {
      key: string;
      name: string;
      icon: string;
    }[]
  >([
    {
      key: "set_bg",
      icon: "",
      name: "背景设置",
    },
  ]);

  getItem("bg", "bg_img").then(
    (res: { type: "image" | "video"; imgFile: File }) => {
      if (res) {
        bgCfn.url = URL.createObjectURL(res.imgFile);
        bgCfn.type = res.type;
      }
    }
  );

  return {
    bgCfn,
    apps,
    searchFocus,
  };
});

export default useApp;
