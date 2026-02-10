<template>
  <div class="text-white flex flex-col w-[600px] bg-black border border-[#333]">
    <!-- Header -->
    <div
      class="border-b border-[#333] px-6 py-4 flex items-center justify-between"
    >
      <div class="flex items-center gap-2">
        <div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        <span class="text-sm font-bold tracking-[0.2em] uppercase"
          >背景设置</span
        >
      </div>
      <div class="flex items-center gap-4">
        <div class="text-[10px] text-[#666] font-mono">SYS.BG.V1.0</div>
      </div>
    </div>

    <div class="p-8 space-y-8">
      <!-- Section 1: Mode Select -->
      <div class="space-y-3">
        <label class="block text-xs text-[#666] uppercase tracking-[0.2em]"
          >模式选择</label
        >
        <div class="flex w-full border border-[#333]">
          <button
            v-for="opt in modeOptions"
            :key="opt.value"
            @click="handleTypeChange(opt.value as any)"
            :class="[
              'flex-1 py-3 text-sm uppercase tracking-wider transition-colors duration-200',
              tempType === opt.value
                ? 'bg-white text-black font-bold'
                : 'bg-transparent text-[#666] hover:text-white hover:bg-[#1a1a1a]',
            ]"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <!-- Section 2: Input -->
      <div v-if="tempType !== 'none' && !tempUrl" class="space-y-3">
        <label class="block text-xs text-[#666] uppercase tracking-[0.2em]"
          >本地资源</label
        >
        <YGUpload
          v-model="tempFile"
          :accept="tempType === 'video' ? 'video/*' : 'image/*'"
          @update:modelValue="validateAndSetFile"
        />
      </div>

      <!-- Section 3: Preview (Technical) -->
      <div
        v-if="tempType !== 'none' && tempUrl"
        class="space-y-3 animate-fade-in"
      >
        <label class="block text-xs text-[#666] uppercase tracking-[0.2em]"
          >效果预览</label
        >

        <!-- Image Preview -->
        <div
          v-if="tempType === 'image'"
          class="w-full h-40 flex justify-center"
        >
          <YGImage :src="tempUrl">
            <template #overlay>
              <div
                class="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 border border-[#333] font-mono z-20"
              >
                RES: {{ tempFile?.name ? "NEW" : "CURRENT" }}
              </div>
            </template>
          </YGImage>
        </div>

        <!-- Video Preview (Keep original implementation as YGImage is for images) -->
        <div
          v-else
          class="w-full h-40 bg-[#050505] border border-[#333] relative p-1 overflow-hidden flex justify-center"
        >
          <video
            :src="tempUrl"
            class="w-auto h-full object-cover opacity-80 transition-opacity duration-500 group-hover:opacity-100"
            autoplay
            muted
            loop
          ></video>

          <div
            class="absolute bottom-2 right-2 bg-black/80 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 border border-[#333] font-mono z-20"
          >
            RES: {{ tempFile?.name ? "NEW" : "CURRENT" }}
          </div>
        </div>
      </div>

      <!-- Execute Button -->
      <YGButton
        @click="applySettings"
        block
      >
        确定
      </YGButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import useApp from "@/store/app";
import { setItem } from "@/utils/indexedDb";
import { ref, onMounted, onUnmounted } from "vue";
import YGUpload from "@/components_ui/YGUpload.vue";
import YGImage from "@/components_ui/YGImage.vue";
import CoverMessage from "@/components_ui/CoverMessage";
import YGButton from "@/components_ui/YGButton.vue";

const appStore = useApp();
const emits = defineEmits(["close"]);

const modeOptions = [
  { label: "无", value: "none" },
  { label: "图片", value: "image" },
  { label: "视频", value: "video" },
];

// 临时状态，用于预览和配置
const tempType = ref<"none" | "image" | "video">("none");
const tempUrl = ref("");
const tempFile = ref<File | undefined>();

// 初始化状态
onMounted(() => {
  if (appStore.bgCfn.type) {
    tempType.value = appStore.bgCfn.type;
    tempUrl.value = appStore.bgCfn.url;
    tempFile.value = appStore.bgCfn.file;
  }
});

// 清理 URL 对象，防止内存泄漏
onUnmounted(() => {
  if (tempUrl.value && tempUrl.value !== appStore.bgCfn.url) {
    URL.revokeObjectURL(tempUrl.value);
  }
});

// 切换类型
const handleTypeChange = (type: "none" | "image" | "video") => {
  tempType.value = type;
  if (type === "none") {
    tempUrl.value = "";
    tempFile.value = undefined;
  } else {
    // 如果已有的文件类型不匹配新类型，则清空
    if (tempFile.value) {
      const fileType = tempFile.value.type.split("/")[0];
      if (fileType !== type) {
        tempUrl.value = "";
        tempFile.value = undefined;
      }
    }
  }
};

const validateAndSetFile = (file: File) => {
  if (!file) return;

  // 简单的类型校验
  const fileType = file.type.split("/")[0];
  if (tempType.value !== "none" && fileType !== tempType.value) {
    new CoverMessage({
      message: `请选择 ${tempType.value === "image" ? "图片" : "视频"} 文件`,
    }).open();
    return;
  }

  // 释放之前的临时 URL
  if (tempUrl.value && tempUrl.value !== appStore.bgCfn.url) {
    URL.revokeObjectURL(tempUrl.value);
  }

  const url = URL.createObjectURL(file);
  tempUrl.value = url;
  tempFile.value = file;
};

// 应用设置
const applySettings = () => {
  if (tempType.value === "none") {
    // 清除背景
    appStore.bgCfn = {
      url: "",
      type: undefined,
      file: undefined,
    };
    setItem("bg", "bg_img", null);
  } else {
    if (tempFile.value) {
      appStore.bgCfn = {
        url: tempUrl.value,
        type: tempType.value,
        file: tempFile.value,
      };
      setItem("bg", "bg_img", {
        type: tempType.value,
        imgFile: tempFile.value,
      });
    }
  }
  emits("close");
};
</script>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
