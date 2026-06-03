<template>
  <div
    ref="appRef"
    class="w-10 h-10 p-2 bg-black/50 rounded-lg cursor-pointer relative select-none backdrop-blur-[20px] hover:!bg-white"
  >
    <!-- <img
      class="w-full h-full"
      :src="data.isDefault ? sysIcons[data.icon] : data.icon"
      draggable="false"
      referrerpolicy="no-referrer"
    /> -->
    <YGImage
      class="w-full h-full left-0 top-0"
      :src="data.isDefault ? sysIcons[data.icon] : data.icon"
      draggable="false"
      referrerpolicy="no-referrer"
    >
      <template #error>
        <div
          class="flex items-center justify-center text-white p-3.5 rounded-md w-full h-full"
          :style="{
            backgroundColor: getInvertColor(getRandomLightColor()),
          }"
        >
          {{ data.name.charAt(0) }}
        </div>
      </template>
    </YGImage>
    <div
      v-if="data.is_default_open"
      class="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-green-400 shadow-[0_0_4px_rgba(74,222,128,0.6)]"
    ></div>
  </div>
</template>

<script setup lang="ts">
import YGImage from "@/components_ui/YGImage.vue";
import { sysIcons } from "@/config";
import { getInvertColor, getRandomLightColor } from "@/utils/color";

defineProps<{
  data: any;
}>();
</script>
