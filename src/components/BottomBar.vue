<template>
  <div class="backdrop-blur-6px bg-white-0\.15 p-2.5 rounded-xl mx-auto mb-2.5 absolute left-1/2 -translate-x-1/2 bottom-0">
    <Draggable v-model:list="appStore.apps">
      <template #default="{ data }">
        <div
          @click="openApp(data)"
          class="w-10 h-10 bg-neutral-900 rounded-lg cursor-pointer select-none"
        >
          <img :src="data.icon" />
        </div>
      </template>
    </Draggable>
  </div>
</template>

<script setup lang="ts">
import Draggable from "@/components_ui/Draggable.vue";
import useApp from "@/store/app";
import { open } from "@/hooks/useDialog";
import BGSetting from "./BGSetting.vue";
const appStore = useApp();


const openApp = (data: any) => {
  open({
    content: BGSetting
  });
};
</script>
