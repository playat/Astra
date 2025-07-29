<template>
  <div class="text-white flex flex-col gap-3">
    <YGButton @click="selectBg('image')"> 图片 </YGButton>

    <YGButton @click="selectBg('video')"> 视频 </YGButton>
  </div>
</template>

<script setup lang="ts">
import YGButton from "@/components_ui/YGButton.vue";
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
      appStore.dialog.visible = false;
    }
  };
};
</script>
