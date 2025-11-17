<template>
  <div
    class="fixed top-8 right-8 w-9 h-9 bg-gray-500 rounded-full overflow-hidden transition-all"
    @mouseenter="enter"
    @mouseleave="leave"
    :style="{
      width: isHover ? `${contentWidth}px` : `2.25rem`,
    }"
  >
    <div class="w-max flex items-center gap-1 p-0.5" ref="contentRef">
      <YGImage
        :src="UserSvg"
        fit="cover"
        class="bg-gray-700 w-8 h-8 rounded-full p-0.5"
      />
      <div
        class="text-white cursor-pointer whitespace-nowrap text-sm"
        @click="authStore.loginOut"
      >
        退出登录
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import YGImage from "@/components_ui/YGImage.vue";
import UserSvg from "@/assets/svg/user.svg";
import { ref } from "vue";
import useAuthStore from "@/store/auth";

const authStore = useAuthStore();
const isHover = ref(false);
const contentRef = ref();
const contentWidth = ref(0);
const enter = () => {
  isHover.value = true;
  contentWidth.value = contentRef.value.offsetWidth;
};

const leave = () => {
  isHover.value = false;
};
</script>
