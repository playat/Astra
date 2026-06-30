<template>
  <div
    class="fixed top-8 right-8 user-btn group"
    @mouseenter="expanded = true"
    @mouseleave="expanded = false"
  >
    <div
      class="flex items-center rounded-full cursor-pointer transition-all duration-300 select-none"
      :class="expanded ? 'bg-white/12 px-3 py-2 pr-4 backdrop-blur-xl gap-2' : 'bg-white/9 p-2 backdrop-blur-xl gap-0'"
      @click="handleLogout()"
    >
      <img
        :src="UserSvg"
        class="w-5 h-5 opacity-90 group-hover:opacity-100 transition-all duration-300"
      />
      <span
        class="text-white/70 text-xs tracking-wide whitespace-nowrap overflow-hidden transition-all duration-300"
        :style="{ maxWidth: expanded ? '5rem' : '0', opacity: expanded ? 1 : 0 }"
      >
        退出登录
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import UserSvg from "@/assets/svg/user.svg";
import useAuthStore from "@/store/auth";
import CoverMessageBox from "@/components_ui/CoverMessageBox";

const authStore = useAuthStore();
const expanded = ref(false);

const handleLogout = () => {
  if (!expanded.value) return;
  new CoverMessageBox({
    title: "退出确认",
    message: "确定要退出登录吗？",
    onConfirm: () => {
      authStore.loginOut();
    },
    onCancel: () => {},
  }).open();
};
</script>
