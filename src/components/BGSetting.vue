<template>
  <div class="text-white">
    <div class="flex items-center gap-4">
      <button
        @click="selectBg('image')"
        class="cursor-pointer bg-indigo-600 text-white px-4 py-1 rounded-lg"
      >
        选择图片
      </button>
      <button
        @click="selectBg('video')"
        class="cursor-pointer bg-indigo-600 text-white px-4 py-1 rounded-lg"
      >
        选择视频
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import useApp from "@/store/app";
import { setItem } from "@/utils/indexedDb";
const appStore = useApp();
const selectBg = (type: "image" | "video") => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = `${type}/*`;
  input.click();

  input.onchange = (e: any) => {
    const file = e.target.files[0];
    if (file) {
      appStore.bgCfn = {
        url: URL.createObjectURL(file),
        type,
      };
      setItem("bg", "bg_img", { type, imgFile: file });
    }
  };
};
</script>
