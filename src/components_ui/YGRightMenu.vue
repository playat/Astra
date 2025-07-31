<template>
  <div class="relative" @contextmenu.prevent="contextMenu">
    <slot />
    <div v-show="showOption" tabindex="-1" @blur="showOption = false" class="absolute left-1/2 -translate-x-1/2 bottom-[calc(100%+10px)] bg-[var(--yg-bg-color)] rounded-lg">
      <div
        class="hover:!text-[var(--yg-color)] transition-all text-white text-nowrap text-xs py-1 px-4"
        v-for="(item, index) in options"
        :key="index"
        @click.stop="$emit('optionClick', item)"
      >
        {{ item.label }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
  options: {
    label: string;
    value?: string;
  }[];
}>();
defineEmits(["optionClick"]);

const showOption = ref(false)

const contextMenu = (e) => {
  showOption.value = true
};

</script>
