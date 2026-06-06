import { getItem } from "@/utils/indexedDb.js";
import { defineStore } from "pinia";
import { Component, computed, reactive, ref } from "vue";
import { getAppLsit } from "@/api/app.js";
import { sysComponents } from "@/config/index.js";
import CoverDialog from "@/components_ui/CoverDialog.js";
import { openTabsViaExtension } from "@/utils/extensionBridge.js";

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

  const apps = ref<
    {
      id: string;
      isDefault: boolean;
      is_default_open: boolean;
      key: string;
      name: string;
      icon: string;
      component?: string;
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

  /**
   * 批量打开默认应用
   * 优先通过浏览器插件打开（绕过弹窗拦截），否则回退到 window.open
   * @returns 是否通过插件打开
   */
  const openMultipleApps = async (
    appsToOpen: typeof apps.value
  ): Promise<boolean> => {
    const urls = appsToOpen
      .filter((app) => !app.isDefault)
      .map((app) => app.key);

    if (urls.length > 0) {
      const openedViaExtension = await openTabsViaExtension(urls);
      if (openedViaExtension) {
        // 插件已处理外部链接，再打开内部系统组件
        appsToOpen
          .filter((app) => app.isDefault)
          .forEach((app) => {
            new CoverDialog({
              component: sysComponents[app.component!],
            }).open();
          });
        return true;
      }

      return false;
    }

    // 全是内部组件，直接打开
    appsToOpen.forEach((app) => openApp(app));
    return false;
  };

  return {
    loadAppLoading,
    bgCfn,
    apps,
    defaultOpenApps,
    loadAppList,
    globlePosition,
    isMore,
    openApp,
    openMultipleApps,
  };
});

export default useApp;
