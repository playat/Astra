<template>
  <div :style="{ height: (600 * 9) / 16 + 'px' }">
    <slot v-if="modelValue" />

    <div
      v-else
      class="border-2 cursor-pointer border-dashed border-[var(--yg-border)] rounded-lg flex items-center justify-center flex-col gap-3 w-full"
      @click="clickSelectFile"
      :style="{ height: (600 * 9) / 16 + 'px' }"
      @drop="onDrop"
      @dragover="(e) => e.preventDefault()"
    >
      <img :src="UploadSvg" alt="上传" class="w-[45px] h-[36px]" />
      <div class="text-sm" style="letter-spacing: 0.1rem">点击或拖放到此处</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import UploadSvg from "@/assets/svg/upload.svg";

const props = defineProps<{
  accept: string;
  modelValue: File | null;
}>();
const emits = defineEmits(["update:modelValue"]);

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

const onDrop = async (e: any) => {
  e.preventDefault();
  e.stopPropagation();
  const realFile = e.dataTransfer.files.item(0);
  if (realFile) {
    emits("update:modelValue", realFile);
  }
};
</script>
