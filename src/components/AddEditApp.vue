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
import { addApp, editApp } from "@/api/app";
import YGButton from "@/components_ui/YGButton.vue";
import YGInput from "@/components_ui/YGInput.vue";
import useApp from "@/store/app";
import { ref } from "vue";

const appStore = useApp();
const form = ref({
  id: "",
  key: "",
  icon: "",
  name: "",
});

const addLoading = ref(false);
const confirm = () => {
  addLoading.value = true;
  if (form.value.id) {
    editApp(form.value)
      .then((res) => {
        if (res.code === 200) {
          appStore.dialog.visible = false;
          appStore.loadAppList();
        }
      })
      .finally(() => {
        addLoading.value = false;
      });
  } else {
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
  }
};

const setForm = (data: any) => {
  form.value.id = data.key;
  form.value.icon = data.icon;
  form.value.key = data.key;
  form.value.name = data.name;
};

const clear = () => {
  form.value.id = "";
  form.value.name = "";
  form.value.icon = "";
  form.value.key = "";
};

defineExpose({
  setForm,
  clear,
});
</script>
