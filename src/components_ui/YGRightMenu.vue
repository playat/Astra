<template>
  <div class="relative" @contextmenu.prevent>
    <slot />
    <div class="absolute bottom-full bg-">
      <div
        class="hover:text-[var(--yg-color)]"
        v-for="(item, index) in options"
        :key="index"
        @click="$emit('optionClick', item)"
      >
        {{ item.label }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  options: {
    label: string;
    value: string;
  }[];
}>();
defineEmits(["optionClick"]);
</script>
