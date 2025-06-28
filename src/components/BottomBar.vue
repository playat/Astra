<template>
  <div
    class="backdrop-blur-6px bg-white-0\.15 p-2.5 rounded-xl mx-auto mb-2.5 absolute left-1/2 -translate-x-1/2 bottom-0"
  >
    <Draggable v-model:list="appStore.apps" v-model:is-drag="isDrag">
      <template #default="{ data }">
        <div
          @click="openApp(data)"
          class="w-10 h-10 p-2 bg-black-0.5 rounded-lg cursor-pointer select-none backdrop-blur-6px"
        >
          <img :src="data.icon" draggable="false" />
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
import { ref } from "vue";
const appStore = useApp();

const isDrag = ref(false);
const openApp = (data: any) => {
  console.log(2);

  if (isDrag.value) return;
  if (!data.isDefault) {
    // window.open(data.key, "_blank");
  }
};
</script>
