import { getItem } from "@/utils/indexedDb.js";
import { defineStore } from "pinia";
import { Component, reactive, ref } from "vue";
import { getAppLsit } from "@/api/app.js";
import { sysComponents } from "@/config/index.js";

const useApp = defineStore("app", () => {
  const token = ref("");
  token.value = localStorage.getItem("token");
  const bgCfn = reactive<{
    url: string;
    type: "image" | "video" | undefined;
  }>({
    url: "",
    type: undefined,
  });

  const searchFocus = ref(false);
  const dialog = reactive({
    visible: false,
    component: null,
  });

  const apps = ref<
    {
      isDefault: boolean;
      key: string;
      name: string;
      icon: string;
      component?: Component;
    }[]
  >([]);

  const loadAppList = () => {
    getAppLsit().then((res) => {
      apps.value = res.data;
    });
  };

  const globlePosition = reactive({
    x: 0,
    y: 0,
  });

  const isMore = ref(false);
  getItem("bg", "bg_img").then(
    (res: { type: "image" | "video"; imgFile: File }) => {
      if (res) {
        bgCfn.url = URL.createObjectURL(res.imgFile);
        bgCfn.type = res.type;
      }
    }
  );

  const openApp = (data: any) => {
    if (!data.isDefault) {
      window.open(data.key, "_blank");
    } else {
      dialog.component = sysComponents[data.component];
      dialog.visible = true;
    }
  };

  const setToken = (val: string) => {
    token.value = val;
    localStorage.setItem("token", val);
  };

  return {
    bgCfn,
    apps,
    loadAppList,
    searchFocus,
    dialog,
    globlePosition,
    isMore,
    openApp,
    token,
    setToken,
  };
});

export default useApp;
