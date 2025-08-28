<template>
  <div class="box">
    <div class="grid-bg" />
    <div
      class="py-6 px-8 bg-[rgb(15 23 42 / 70%)] rounded-md"
      style="filter: blur(10px);"
    >
      <div class="text-white">Enter Your Password</div>
      <input
        type="password"
        class="password-input"
        placeholder=""
        autocomplete="off"
        autocorrect="off"
        spellcheck="false"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { getPublicKey, login } from "@/api/app";
import { encryptData } from "@/utils/CryptoJS";
import { onMounted, ref } from "vue";

const pwd = ref("");
let publicKey = "";
const loadPublicKey = () => {
  getPublicKey().then((res) => {
    publicKey = res.data;
  });
};

const loginFn = () => {
  encryptData({ pwd: pwd.value }, publicKey).then((encryptRes) => {
    login(encryptRes).then((res) => {});
  });
};

onMounted(() => {
  loadPublicKey();
});
</script>

<style scoped>
.grid-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 200%;
  height: 200%;
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

.box {
  background-color: #0f172a;
  overflow: hidden;
  height: 100%;
  width: 100%;
  display: flex;
  left: 0;
  top: 0;
  justify-content: center;
  align-items: center;
  position: fixed;
  z-index: 50;
}

.password-input {
  width: 370px;
  height: 46px;
  background-color: rgb(30 41 59 / 50%);
  border-bottom: 2px solid rgba(59, 130, 246, 0.5);
  padding: 0 20px;
  font-size: 18px;
  margin-top: 8px;
  color: #e2e8f0;
  outline: none;
  text-align: center;
  transition: all 0.3s ease;
  box-shadow: 0 0 10px rgba(59, 130, 246, 0);
  position: relative;
  z-index: 1;
}

.password-input:focus {
  border-color: rgba(59, 130, 246, 1);
  box-shadow: 0 13px 5px -5px rgba(59, 130, 246, 0.5);
}

.password-input::placeholder {
  color: rgba(226, 232, 240, 0.3);
}

@media (max-width: 640px) {
  .password-input {
    width: 85%;
  }
}
</style>
