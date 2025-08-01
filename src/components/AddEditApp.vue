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
import { onMounted, ref } from "vue";

const props = defineProps<{
  formData: any;
}>();
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

const setForm = () => {
  form.value.id = props.formData.key;
  form.value.icon = props.formData.icon;
  form.value.key = props.formData.key;
  form.value.name = props.formData.name;
};

const clear = () => {
  form.value.id = "";
  form.value.name = "";
  form.value.icon = "";
  form.value.key = "";
};

onMounted(() => {
  console.log("mounted");
  
  if (props.formData) {
    setForm();
  }
});

defineExpose({
  clear,
});
</script>
