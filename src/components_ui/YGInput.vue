<template>
  <div
    class="flex text-sm gap-2.5 items-center bg-[var(--yg-bg-color-shallow)] rounded-lg py-2.5 px-4"
  >
    <slot name="perfix" />
    <input
      :placeholder="placeholder"
      :value="value"
      :type="type"
      @input="$emit('update:value', ($event.target as HTMLInputElement).value)"
      class="bg-transparent border-none w-full text-white"
    />
  </div>
</template>

<script setup lang="ts">
import { InputTypeHTMLAttribute } from 'vue';

defineProps<{
  value: string | number;
  placeholder?: string;
  type?: InputTypeHTMLAttribute
}>();

const emits = defineEmits(["update:value"]);
</script>
