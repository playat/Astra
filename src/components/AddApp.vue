<template>
  <div class="text-white w-96">
    <input placeholder="应用url" v-model="form.key" />
    <div>应用名称：{{ form.name }}</div>
    <div>图标地址： {{ form.icon }}</div>

    <button class="cursor-pointer" @click="confirm">确定</button>
  </div>
</template>

<script setup lang="ts">
import { addApp } from "@/api/app";
import { ref } from "vue";

const form = ref({
  key: "",
  icon: "",
  name: "",
});

const confirm = () => {
  addApp(form.value).then(res => {
    console.log(res);
    
  })
};
</script>
