<template>
  <div class="text-white">
    <input placeholder="应用url" v-model="form.url" />
    <button @click="confirm">确定</button>
    <div>应用名称：{{ form.appName }}</div>
    <div>图标地址： {{ form.iconUrl }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";

const form = ref({
  url: "",
  appName: "",
  iconUrl: "",
});

const confirm = async () => {
  //   const fetchRes = await fetch(form.value.url);
  //   const textJson = await fetchRes.text();
  //   console.log(textJson);
  // 创建iframe并获取其内容
  const iframe = document.createElement("iframe");
  iframe.src = form.value.url; // 同源页面
  iframe.onload = function () {
    try {
      // 仅当iframe与主页面同源时可访问其内容
      const html = iframe.contentDocument.documentElement.outerHTML;
      console.log("iframe中的HTML:", html);
    } catch (error) {
      console.error("跨域限制，无法获取非同源iframe内容");
    }
  };
  document.body.appendChild(iframe);
};
</script>
