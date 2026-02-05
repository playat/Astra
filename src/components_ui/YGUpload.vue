<template>
  <div class="w-full h-32">
    <slot v-if="modelValue" />

    <div
      v-else
      class="relative w-full h-full border border-dashed border-[#333] bg-[#0f0f0f] transition-all duration-300 group cursor-pointer"
      :class="{
        'border-white bg-[#1a1a1a]': isDragging,
        'hover:border-[#666] hover:bg-[#1a1a1a]': !isDragging
      }"
      @click="clickSelectFile"
      @dragenter.prevent="isDragging = true"
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop="onDrop"
    >
      <label class="w-full h-full flex flex-col items-center justify-center gap-2 cursor-pointer absolute inset-0 z-10">
        <div
          class="w-8 h-8 border border-[#444] flex items-center justify-center text-[#444] transition-colors duration-300"
          :class="isDragging ? 'border-white text-white scale-110' : 'group-hover:border-white group-hover:text-white'"
        >
          <span class="text-lg leading-none mb-0.5">+</span>
        </div>
        <span
          class="text-xs text-[#444] uppercase tracking-widest transition-colors duration-300"
          :class="isDragging ? 'text-white' : 'group-hover:text-white'"
        >
          {{ isDragging ? '释放文件' : '点击或拖拽文件至此' }}
        </span>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{
  accept: string;
  modelValue: File | undefined | null;
}>();
const emits = defineEmits(["update:modelValue"]);

const isDragging = ref(false);

const clickSelectFile = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = props.accept;

  input.onchange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      emits("update:modelValue", file);
    }
  };
  input.click();
};

const onDrop = async (e: DragEvent) => {
  e.preventDefault();
  e.stopPropagation();
  isDragging.value = false;
  
  const realFile = e.dataTransfer?.files.item(0);
  if (realFile) {
    emits("update:modelValue", realFile);
  }
};
</script>
