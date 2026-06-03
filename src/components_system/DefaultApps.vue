<template>
  <div class="p-4 min-w-[320px] max-w-[420px]">
    <div class="text-white text-sm mb-3 tracking-wide">默认打开应用</div>

    <div
      v-if="!appStore.defaultOpenApps.length"
      class="text-gray-500 text-xs py-6 text-center"
    >
      暂无默认打开的应用
    </div>

    <div v-else class="flex flex-col gap-1 max-h-[360px] overflow-y-auto pr-1">
      <div
        v-for="app in appStore.defaultOpenApps"
        :key="app.id"
        class="flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-white/10 cursor-pointer select-none"
      >
        <AppItem :data="app" />
        <span class="text-white text-xs truncate">{{ app.name }}</span>
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

const appStore = useApp();
const opening = ref(false);

const openAll = async () => {
  if (!appStore.defaultOpenApps.length) return;
  opening.value = true;
  for (const app of appStore.defaultOpenApps) {
    appStore.openApp(app);
    await new Promise((r) => setTimeout(r, 500));
  }
  opening.value = false;
};
</script>
