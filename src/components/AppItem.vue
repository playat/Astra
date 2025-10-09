<template>
  <div
    ref="appRef"
    class="w-10 h-10 p-2 bg-black-0.5 rounded-lg cursor-pointer relative select-none backdrop-blur-20px hover:!bg-white"
  >
    <div
      class="app-name pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 text-nowrap text-sm text-white py-2 opacity-0 px-4 rounded-md bg-[var(--yg-bg-color)]"
    >
      {{ data.name }}
    </div>
    <img
      class="w-full h-full"
      :src="data.isDefault ? sysIcons[data.icon] : data.icon"
      draggable="false"
      referrerpolicy="no-referrer"
    />
    <YGImage
      class="w-full h-full"
      :src="data.isDefault ? sysIcons[data.icon] : data.icon"
      draggable="false"
      referrerpolicy="no-referrer"
    />
  </div>
</template>

<script setup lang="ts">
import YGImage from "@/components_ui/YGImage.vue";
import { sysIcons } from "@/config";

defineProps<{
  data: any;
}>();
</script>
