<template>
  <div
    class="bg-[#0f172a] overflow-hidden w-full h-full flex justify-center items-center fixed left-0 top-0 z-50"
  >
    <div class="grid-bg absolute left-0 top-0 w-[200%] h-[200%]" />
    <!-- <div class="py-6 px-8 bg-[rgba(15,23,42,0.7)] rounded-md"> -->
    <div
      class="py-6 px-8 rounded-md w-[370px] max-w-11/12"
      style="background-color: rgba(30, 58, 138, 0.1)"
    >
      <div class="text-[#e2e8f0]">Enter Password</div>
      <div class="pb-6 overflow-hidden">
        <input
          v-model="pwd"
          type="password"
          class="password-input relative w-full h-[46px] bg-[#1e293b80] border-b-2 border-[#3b82f680] px-5 text-lg mt-2 text-[#e2e8f0] text-center transition-all"
          placeholder="ENTER PWD"
          autocomplete="off"
          autocorrect="off"
          spellcheck="false"
          @keydown.enter="loginFn"
        />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { getPublicKey, login } from "@/api/white";
import CoverMessage from "@/components_ui/CoverMessage";
import useApp from "@/store/app";
import useAuthStore from "@/store/auth";
import { encryptData } from "@/utils/CryptoJS";
import { onMounted, ref } from "vue";

const authStore = useAuthStore();
const appStore = useApp();
const pwd = ref("");
let publicKey = "";
const loadPublicKey = () => {
  getPublicKey().then((res) => {
    publicKey = res.data;
  });
};

const loginFn = () => {
  encryptData({ pwd: pwd.value }, publicKey).then((encryptRes) => {
    login(encryptRes).then((res) => {
      if (res.data.token) {
        authStore.setToken(res.data.token);
        appStore.loadAppList();
        new CoverMessage({
          message: "登录成功",
        }).open();
      } else {
        new CoverMessage({
          message: "登录失败",
        }).open();
      }
    });
  });
};

onMounted(() => {
  loadPublicKey();
});
</script>

<style scoped>
.grid-bg {
  background-image: linear-gradient(rgba(30, 58, 138, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(30, 58, 138, 0.1) 1px, transparent 1px);
  background-size: 40px 40px;
  animation: scroll 60s linear infinite;
}

@keyframes scroll {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(-50%, -50%);
  }
}

.password-input:focus {
  border-color: #3b82f6;
  box-shadow: 0 5px 8px rgba(59, 130, 246, 0.5);
}

.password-input::placeholder {
  color: rgba(226, 232, 240, 0.3);
}
</style>
