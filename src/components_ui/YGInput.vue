<template>
  <div
    class="flex text-sm gap-3 items-center bg-[#0a0a0a] border border-[#333] transition-all duration-300 focus-within:border-white focus-within:bg-[#111] group relative px-4 py-3"
  >
    <!-- 左侧装饰条，聚焦时显示 -->
    <div
      class="absolute left-0 top-0 bottom-0 w-0.5 bg-white opacity-0 transition-opacity duration-300 group-focus-within:opacity-100"
    ></div>

    <div
      class="text-[#666] group-focus-within:text-white transition-colors duration-300"
    >
      <slot name="perfix" />
    </div>

    <input
      :disabled="disabled"
      v-if="type === 'default' || !type"
      :placeholder="placeholder"
      :value="value"
      @input="$emit('update:value', ($event.target as HTMLInputElement).value)"
      class="bg-transparent border-none w-full text-[#ccc] placeholder-[#444] outline-none font-mono text-xs tracking-wide focus:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    />
    <textarea
      :disabled="disabled"
      v-if="type === 'textarea'"
      :placeholder="placeholder"
      :value="value"
      @input="$emit('update:value', ($event.target as HTMLInputElement).value)"
      class="bg-transparent border-none w-full text-[#ccc] placeholder-[#444] outline-none font-mono text-xs tracking-wide focus:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed resize-none min-h-[80px]"
    />

    <!-- 右下角装饰角标 -->
    <div
      class="absolute bottom-0 right-0 w-2 h-2 border-r border-b border-[#333] transition-colors duration-300 group-focus-within:border-white"
    ></div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  value: string | number;
  placeholder?: string;
  disabled?: boolean;
  type?: "default" | "textarea";
}>();

const emits = defineEmits(["update:value"]);
</script>
