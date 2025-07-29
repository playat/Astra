import { getItem } from "@/utils/indexedDb.js";
import { defineStore } from "pinia";
import { Component, reactive, ref } from "vue";
import BGicon from "@/assets/svg/bg-icon.svg";
import BGSetting from "@/components/BGSetting.vue";
import { getAppLsit } from "@/api/app.js";

const useApp = defineStore("app", () => {
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
  const defaultApp = [
    {
      key: "set_bg",
      isDefault: true,
      icon: BGicon,
      name: "背景设置",
      component: BGSetting,
    },
  ];
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
      apps.value = [...defaultApp, ...res.data];
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
      dialog.component = data.component;
      dialog.visible = true;
    }
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
  };
});

export default useApp;
