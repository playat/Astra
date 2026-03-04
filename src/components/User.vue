<template>
  <div class="fixed top-8 right-8 group cursor-pointer" @click="handleLogout()">
    <div
      class="w-10 h-10 bg-gradient-to-br from-[#38bdf8] to-[#818cf8] rounded-lg group-hover:rounded-2xl transition-all duration-500 p-[1px] animate-float-mini"
    >
      <div class="w-full h-full p-2 bg-[#0f172a] rounded-[inherit] overflow-hidden">
        <img
          :src="UserSvg"
          class="w-full h-full object-cover hover:mix-blend-luminosity transition-all"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import UserSvg from "@/assets/svg/user.svg";
import useAuthStore from "@/store/auth";
import CoverMessageBox from "@/components_ui/CoverMessageBox";
import Message from "@/components_ui/CoverMessage";

const authStore = useAuthStore();

const handleLogout = () => {
  new CoverMessageBox({
    title: "退出确认",
    message: "确定要退出登录吗？",
    onConfirm: () => {
      authStore.loginOut();
      Message.open({ message: "已退出登录" });
    },
    onCancel: () => {
      // 取消操作，不做任何处理
    },
  }).open();
};
</script>
<style scoped>
/* 
  Tailwind Arbitrary Values used for portability:
  gemini-blue -> #38bdf8
  gemini-purple -> #818cf8
  card -> #0f172a
*/

.animate-float-mini {
  animation: float-mini 3s ease-in-out infinite;
}

@keyframes float-mini {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-3px);
  }
}
</style>
