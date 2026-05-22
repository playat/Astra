<template>
  <div class="p-4 min-w-[320px] max-w-[420px]">
    <div class="text-white text-sm mb-3 tracking-wide">默认打开应用</div>

    <div
      v-if="loading"
      class="flex items-center justify-center py-6"
    >
      <YGLoading />
    </div>

    <div
      v-else-if="!appStore.apps.length"
      class="text-gray-500 text-xs py-6 text-center"
    >
      暂无应用，请先添加
    </div>

    <div v-else class="flex flex-col gap-1 max-h-[360px] overflow-y-auto pr-1">
      <div
        v-for="app in appStore.apps.filter(a => !a.isDefault)"
        :key="app.key"
        class="flex items-center gap-3 px-2 py-1.5 rounded-md hover:bg-white-0.1 cursor-pointer select-none"
        @click="toggle(app)"
      >
        <div
          class="w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors"
          :class="
            selectedIds.has(app.id)
              ? 'bg-white border-white'
              : 'border-gray-500'
          "
        >
          <svg
            v-if="selectedIds.has(app.id)"
            class="w-3 h-3"
            viewBox="0 0 24 24"
            fill="none"
            stroke="black"
            stroke-width="3"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <AppItem :data="app" />
        <span class="text-white text-xs truncate">{{ app.name }}</span>
      </div>
    </div>

    <div class="flex gap-2 mt-4">
      <YGButton block :loading="opening" :disabled="!selectedIds.size" @click="openAll">
        全部打开 ({{ selectedIds.size }})
      </YGButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import useApp from "@/store/app";
import AppItem from "@/components/AppItem.vue";
import YGButton from "@/components_ui/YGButton.vue";
import YGLoading from "@/components_ui/YGLoading.vue";
import { getDefaultApps, setDefaultApps } from "@/api/defaultApp";

const appStore = useApp();

const selectedIds = ref<Set<string>>(new Set());
const loading = ref(true);
const opening = ref(false);

defineProps<{
  onClose?: () => void;
}>();

onMounted(async () => {
  try {
    const res: any = await getDefaultApps();
    selectedIds.value = new Set(res.data || []);
  } finally {
    loading.value = false;
  }
});

const toggle = async (app: any) => {
  const next = new Set(selectedIds.value);
  if (next.has(app.id)) {
    next.delete(app.id);
  } else {
    next.add(app.id);
  }
  selectedIds.value = next;
  await setDefaultApps([...next]);
};

const openAll = async () => {
  if (!selectedIds.value.size) return;
  opening.value = true;
  const targets = appStore.apps.filter((a) => selectedIds.value.has(a.id));
  for (const app of targets) {
    appStore.openApp(app);
    await new Promise((r) => setTimeout(r, 500));
  }
  opening.value = false;
};
</script>
