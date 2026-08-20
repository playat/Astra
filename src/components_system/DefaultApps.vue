<template>
  <div class="p-4 min-w-[320px] max-w-105">
    <div class="text-white text-sm mb-3 tracking-wide">默认打开应用</div>

    <div
      v-if="!appStore.defaultOpenApps.length"
      class="text-gray-500 text-xs py-6 text-center"
    >
      暂无默认打开的应用
    </div>

    <div v-else class="flex flex-col gap-1 max-h-90 overflow-y-auto pr-1">
      <div
        v-for="app in appStore.defaultOpenApps"
        :key="app.id"
        class="flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-white/10 group"
      >
        <AppItem :data="app" />
        <span class="text-white text-xs truncate flex-1">{{ app.name }}</span>
        <button
          class="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-400 transition-all p-1 rounded hover:bg-white/10"
          title="从默认打开列表移除"
          @click.stop="removeFromDefault(app)"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <div class="flex gap-2 mt-4">
      <YGButton block :loading="opening" :disabled="!appStore.defaultOpenApps.length" @click="openAll">
        全部打开 ({{ appStore.defaultOpenApps.length }})
      </YGButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import useApp from "@/store/app";
import AppItem from "@/components/AppItem.vue";
import YGButton from "@/components_ui/YGButton.vue";
import CoverMessageBox from "@/components_ui/CoverMessageBox";
import { detectExtension, openTabsViaExtension } from "@/utils/extensionBridge";
import { setDefaultOpen } from "@/api/app";

const appStore = useApp();
const opening = ref(false);

const removeFromDefault = (app: any) => {
  new CoverMessageBox({
    title: "移除默认打开",
    message: `确定要将「${app.name}」从默认打开列表中移除吗？`,
    onConfirm: async () => {
      try {
        await setDefaultOpen(app.id, 0);
        appStore.loadAppList();
      } catch (error) {
        console.error("移除默认打开失败:", error);
      }
    },
  }).open();
};

const openAll = async () => {
  if (!appStore.defaultOpenApps.length) return;

  opening.value = true;
  
  try {
    const installed = await detectExtension();
    console.log("installed",installed);
    
    if (!installed) {
      new CoverMessageBox({
        title: "提示",
        message: "未检测到浏览器插件，请先安装插件后再使用批量打开功能",
      }).open();
      return;
    }

    const urls = appStore.defaultOpenApps
      .filter((app) => !app.isDefault)
      .map((app) => app.key);

    if (urls.length > 0) {
      await openTabsViaExtension(urls);
    }

    appStore.defaultOpenApps
      .filter((app) => app.isDefault)
      .forEach((app) => appStore.openApp(app));
  } finally {
    opening.value = false;
  }
};
</script>
