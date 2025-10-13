<template>
  <div class="text-white flex flex-col gap-3 w-[600px]">
    <YGButton @click="selectBg('image')"> 图片 </YGButton>

    <YGButton @click="selectBg('video')"> 视频 </YGButton>
    <!-- 图片 -->
    <YGUpload
      key="image"
      :model-value="appStore.bgCfn.file"
      @update:model-value="updatecallBack($event, 'image')"
      accept="image/*"
    >
      <img
        v-if="appStore.bgCfn.type === 'image'"
        :src="appStore.bgCfn.url"
        class="object-cover w-full h-full"
      />
    </YGUpload>
    <!-- 视频 -->
    <YGUpload
      key="video"
      :model-value="appStore.bgCfn.file"
      @update:model-value="updatecallBack($event, 'video')"
      accept="video/*"
    >
      <!-- <video
        v-if="appStore.bgCfn.type === 'video'"
        :src="appStore.bgCfn.url"
        class="object-cover w-full h-full"
        loop
        muted
        autoplay
      /> -->
    </YGUpload>
  </div>
</template>

<script setup lang="ts">
import YGButton from "@/components_ui/YGButton.vue";
import useApp from "@/store/app";
import { setItem } from "@/utils/indexedDb";
import UploadSvg from "@/assets/svg/upload.svg";
import YGUpload from "@/components_ui/YGUpload.vue";
import { ref } from "vue";
const appStore = useApp();
const emits = defineEmits(["close"]);

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
        file,
      };
      setItem("bg", "bg_img", { type, imgFile: file });
      emits("close");
    }
  };
};

const updatecallBack = (file: File, type: "image" | "video") => {
  appStore.bgCfn = {
    url: URL.createObjectURL(file),
    type,
    file,
  };
  setItem("bg", "bg_img", { type, imgFile: file });
  emits("close");
};
</script>
