<template>
  <div class="text-white flex flex-col w-[600px] bg-black border border-[#333]">
    <!-- 标题栏 -->
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
      <!-- 模式选择 -->
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
              activeType === opt.value
                ? 'bg-white text-black font-bold'
                : 'bg-transparent text-[#666] hover:text-white hover:bg-[#1a1a1a]',
            ]"
          >
            {{ opt.label }}
          </button>
        </div>
      </div>

      <!-- 上传区域：切换类型后或无当前背景时显示 -->
      <div v-if="showUpload" class="space-y-3">
        <label class="block text-xs text-[#666] uppercase tracking-[0.2em]"
          >本地资源</label
        >
        <YGUpload
          v-model="pendingFile"
          :accept="activeType === 'video' ? 'video/*' : 'image/*'"
          @update:modelValue="validateAndSetFile"
        />
      </div>

      <!-- 预览：当前背景或新选择的文件 -->
      <div
        v-if="activeType !== 'none' && previewUrl"
        class="space-y-3 animate-fade-in"
      >
        <label class="block text-xs text-[#666] uppercase tracking-[0.2em]"
          >效果预览</label
        >

        <!-- 图片预览 -->
        <div
          v-if="activeType === 'image'"
          class="w-full h-40 flex justify-center"
        >
          <YGImage :src="previewUrl">
            <template #overlay>
              <div
                class="absolute bottom-2 right-2 flex items-center gap-2 z-20"
              >
                <div
                  class="bg-black/80 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 border border-[#333] font-mono"
                >
                  RES: {{ isPending ? "NEW" : "CURRENT" }}
                </div>
                <button
                  @click="forceUpload = true"
                  class="bg-black/80 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 border border-[#333] font-mono cursor-pointer hover:bg-white/20 transition-colors"
                >
                  更换
                </button>
              </div>
            </template>
          </YGImage>
        </div>

        <!-- 视频预览 -->
        <div
          v-else
          class="w-full h-40 bg-[#050505] border border-[#333] relative p-1 overflow-hidden flex justify-center"
        >
          <video
            :src="previewUrl"
            class="w-auto h-full object-cover opacity-80 transition-opacity duration-500 group-hover:opacity-100"
            autoplay
            muted
            loop
          ></video>

          <div
            class="absolute bottom-2 right-2 flex items-center gap-2 z-20"
          >
            <div
              class="bg-black/80 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 border border-[#333] font-mono"
            >
              RES: {{ isPending ? "NEW" : "CURRENT" }}
            </div>
            <button
              @click="forceUpload = true"
              class="bg-black/80 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 border border-[#333] font-mono cursor-pointer hover:bg-white/20 transition-colors"
            >
              更换
            </button>
          </div>
        </div>
      </div>

      <!-- 确定按钮 -->
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
import { ref, computed, onMounted, onUnmounted } from "vue";
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

// 当前激活的 tab 类型
const activeType = ref<"none" | "image" | "video">("none");

// 待确认状态：用户选择了新文件后才会设置
const pendingFile = ref<File | undefined>();
const pendingUrl = ref("");
const forceUpload = ref(false);

// 预览地址：优先显示待确认的新文件，其次显示当前背景
const previewUrl = computed(() => {
  if (pendingUrl.value) return pendingUrl.value;
  if (appStore.bgCfn.type === activeType.value) return appStore.bgCfn.url;
  return "";
});

// 是否显示上传区域：无 tab 或已选文件时隐藏，强制模式下显示
const showUpload = computed(() => {
  if (activeType.value === "none") return false;
  if (pendingUrl.value) return false;
  if (forceUpload.value) return true;
  if (appStore.bgCfn.type === activeType.value) return false;
  return true;
});

// 是否有待确认的文件
const isPending = computed(() => !!pendingUrl.value);

// 释放临时 URL，排除当前背景正在使用的地址
const releaseUrl = (url: string) => {
  if (url && url !== appStore.bgCfn.url) {
    URL.revokeObjectURL(url);
  }
};

// 初始化：根据当前背景类型激活对应 tab
onMounted(() => {
  activeType.value = appStore.bgCfn.type ?? "none";
});

// 卸载时释放临时 URL
onUnmounted(() => {
  releaseUrl(pendingUrl.value);
});

// 切换类型：清空待确认状态，显示上传模块
const handleTypeChange = (type: "none" | "image" | "video") => {
  activeType.value = type;
  releaseUrl(pendingUrl.value);
  pendingFile.value = undefined;
  pendingUrl.value = "";
  forceUpload.value = false;
};

// 文件选择校验
const validateAndSetFile = (file: File) => {
  if (!file) return;

  const fileType = file.type.split("/")[0];
  if (activeType.value !== "none" && fileType !== activeType.value) {
    new CoverMessage({
      message: `请选择 ${activeType.value === "image" ? "图片" : "视频"} 文件`,
    }).open();
    return;
  }

  releaseUrl(pendingUrl.value);
  pendingUrl.value = URL.createObjectURL(file);
  pendingFile.value = file;
  forceUpload.value = false;
};

// 应用设置：只有选了新文件或选了"无"才会实际变更背景
const applySettings = () => {
  if (activeType.value === "none") {
    appStore.bgCfn = { url: "", type: undefined, file: undefined };
    setItem("bg", "bg_img", null);
  } else if (pendingFile.value && pendingUrl.value) {
    appStore.bgCfn = {
      url: pendingUrl.value,
      type: activeType.value,
      file: pendingFile.value,
    };
    setItem("bg", "bg_img", {
      type: activeType.value,
      imgFile: pendingFile.value,
    });
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
