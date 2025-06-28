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
      isDefault: boolean;
      key: string;
      name: string;
      icon: string;
    }[]
  >([
    {
      key: "set_bg",
      isDefault: true,
      icon: "",
      name: "背景设置",
    },
    {
      key: "https://www.mi.com/",
      isDefault: false,
      icon: "https://s01.mifile.cn/favicon.ico",
      name: "小米官网"
    }
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
