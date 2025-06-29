import { getItem } from "@/utils/indexedDb.js";
import { defineStore } from "pinia";
import { Component, reactive, ref } from "vue";
import BGicon from "@/assets/svg/bg-icon.svg";

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
  const apps = ref<
    {
      isDefault: boolean;
      key: string;
      name: string;
      icon: string;
      component?: Component;
    }[]
  >([
    {
      key: "set_bg",
      isDefault: true,
      icon: BGicon,
      name: "背景设置",
      component: () => import("@/components/BGSetting.vue"),
    },
    {
      key: "https://www.mi.com/",
      isDefault: false,
      icon: "https://s01.mifile.cn/favicon.ico",
      name: "小米官网",
    },
    {
      key: "https://www.doubao.com/chat/",
      isDefault: false,
      icon: "//lf-flow-web-cdn.doubao.com/obj/flow-doubao/doubao/web/logo-icon.png",
      name: "豆包",
    },
    {
      key: "https://element-plus.org/zh-CN/component/overview.html",
      isDefault: false,
      icon: "https://element-plus.org/images/element-plus-logo-small.svg",
      name: "Element Plus",
    },
  ]);
  const globlePosition = reactive({
    x: 0,
    y: 0,
  });
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
    dialog,
    globlePosition,
  };
});

export default useApp;
