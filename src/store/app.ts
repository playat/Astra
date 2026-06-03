import { getItem } from "@/utils/indexedDb.js";
import { defineStore } from "pinia";
import { Component, computed, reactive, ref } from "vue";
import { getAppLsit } from "@/api/app.js";
import { sysComponents } from "@/config/index.js";
import CoverDialog from "@/components_ui/CoverDialog.js";

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
      id: string;
      isDefault: boolean;
      is_default_open: boolean;
      key: string;
      name: string;
      icon: string;
      component?: Component;
    }[]
  >([]);

  const defaultOpenApps = computed(() =>
    apps.value.filter((app) => app.is_default_open)
  );
  const loadAppLoading = ref(false);
  const loadAppList = () => {
    loadAppLoading.value = true;
    getAppLsit()
      .then((res) => {
        apps.value = res.data.map((item: any) => ({
          ...item,
          is_default_open: item.is_default_open === 1,
        }));
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
      new CoverDialog({
        component: sysComponents[data.component],
      }).open();
    }
  };

  return {
    loadAppLoading,
    bgCfn,
    apps,
    defaultOpenApps,
    loadAppList,
    searchFocus,
    globlePosition,
    isMore,
    openApp,
  };
});

export default useApp;
