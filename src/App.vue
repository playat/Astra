<template>
  <BG />
  <CenterBar />
  <BottomBar />
  <TimeNumber />
  <SearchBar />
  <SuList />
  <YGDialog />
  <div class="fixed left-0 top-0 bg-black w-full h-full z-50 p-28">
    <YGInput v-model:value="pwd" class="w-96" />
    <YGButton @click="loginFn">登录</YGButton>
  </div>
</template>

<script setup lang="ts">
import BottomBar from "@/components/BottomBar.vue";
import SearchBar from "@/components/SearchBar.vue";
import BG from "@/components/BG.vue";
import CenterBar from "@/components/CenterBar.vue";
import TimeNumber from "./components/TimeNumber.vue";
import YGDialog from "./components_ui/YGDialog.vue";
import useApp from "./store/app";
import SuList from "./components/SuList.vue";
import { onMounted, ref } from "vue";
import YGInput from "./components_ui/YGInput.vue";
import YGButton from "./components_ui/YGButton.vue";
import { getPublicKey, login } from "./api/app";
import { encryptData } from "./utils/CryptoJS";

const appStore = useApp();

const pwd = ref("666");

document.addEventListener(
  "mousedown",
  (event) => {
    appStore.globlePosition.x = event.clientX;
    appStore.globlePosition.y = event.clientY;
  },
  true
);

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
  // appStore.loadAppList();
  loadPublicKey();
});
</script>
