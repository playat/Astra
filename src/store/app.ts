import { getItem } from "@/utils/indexedDb.js";
import { defineStore } from "pinia";
import { Component, reactive, ref } from "vue";
import { getAppLsit } from "@/api/app.js";
import { sysComponents } from "@/config/index.js";
import Dialog from "@/components_ui/Dialog.js";

const useApp = defineStore("app", () => {
  const bgCfn = reactive<{
    url: string;
    type: "image" | "video" | undefined;
    file?: File;
  }>({
    url: "",
    type: undefined,
    file: undefined,
  });

  const searchFocus = ref(false);

  const apps = ref<
    {
      isDefault: boolean;
      key: string;
      name: string;
      icon: string;
      component?: Component;
    }[]
  >([]);
  const loadAppLoading = ref(false);
  const loadAppList = () => {
    loadAppLoading.value = true;
    getAppLsit()
      .then((res) => {
        apps.value = res.data;
      })
      .finally(() => {
        loadAppLoading.value = false;
      });
  };

  const globlePosition = reactive({
    x: 0,
    y: 0,
  });

  const isMore = ref(false); // 是否打开抽屉
  getItem("bg", "bg_img").then(
    (res: { type: "image" | "video"; imgFile: File }) => {
      if (res) {
        bgCfn.file = res.imgFile;
        bgCfn.url = URL.createObjectURL(res.imgFile);
        bgCfn.type = res.type;
      }
    }
  );

  const openApp = (data: any) => {
    if (!data.isDefault) {
      window.open(data.key, "_blank");
    } else {
      new Dialog().open({
        component: sysComponents[data.component],
      });
    }
  };

  return {
    loadAppLoading,
    bgCfn,
    apps,
    loadAppList,
    searchFocus,
    globlePosition,
    isMore,
    openApp,
  };
});

export default useApp;
