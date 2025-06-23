<template>
  <div class="text-white px-24 text-center mt-10 flex-grow">
    <button @click="selectBg">选择背景</button>
  </div>
</template>

<script setup lang="ts">
import { setItem } from "@/utils/indexedDb";
const selectBg = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "image/*";
  input.click();

  input.onchange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      console.log("选中文件:", file);
      setItem("bg", file.name, file)
    }
  };
};
</script>
