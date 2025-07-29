<template>
  <div class="text-white w-96 flex flex-col gap-3">
    <div>
      <div class="text-sm">应用地址</div>
      <YGInput v-model:value="form.key" placeholder="网页URL" class="mt-2" />
    </div>
    <div>
      <div class="text-sm">应用名称</div>
      <YGInput v-model:value="form.name" placeholder="网页URL" class="mt-2" />
    </div>
    <YGButton @click="confirm" :loading="addLoading"> 确定 </YGButton>
  </div>
</template>

<script setup lang="ts">
import { addApp } from "@/api/app";
import YGButton from "@/components_ui/YGButton.vue";
import YGInput from "@/components_ui/YGInput.vue";
import useApp from "@/store/app";
import { ref } from "vue";

const appStore = useApp();
const form = ref({
  key: "",
  icon: "",
  name: "",
});

const addLoading = ref(false);
const confirm = () => {
  addLoading.value = true;
  addApp(form.value)
    .then((res) => {
      if (res.code === 200) {
        appStore.dialog.visible = false;
        appStore.loadAppList();
      }
    })
    .finally(() => {
      addLoading.value = false;
    });
};
</script>
