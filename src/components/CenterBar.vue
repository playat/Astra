<template>
  <div class="text-white px-24 text-center mt-10 flex-grow">
    <button @click="selectBg('image')">选择图片</button>
    -
    <button @click="selectBg('video')">选择视频</button>
  </div>
</template>

<script setup lang="ts">
import useApp from "@/store/app";
import { setItem } from "@/utils/indexedDb";
const appStore = useApp()
const selectBg = (type: "image" | "video") => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = `${type}/*`;
  input.click();

  input.onchange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      appStore.bgCfn = {
        url :URL.createObjectURL(file),
        type
      }
      setItem("bg", "bg_img", { type, imgFile: file });
    }
  };
};
</script>
