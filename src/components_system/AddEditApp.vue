<template>
  <div class="text-white flex flex-col w-[500px] bg-black border border-[#333]">
    <!-- Header -->
    <div
      class="border-b border-[#333] px-6 py-4 flex items-center justify-between"
    >
      <div class="flex items-center gap-2">
        <div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        <span class="text-sm font-bold tracking-[0.2em] uppercase"
          >应用配置</span
        >
      </div>
      <div class="flex items-center gap-4">
        <div class="text-[10px] text-[#666] font-mono">SYS.APP.V1.0</div>
      </div>
    </div>

    <div class="p-8 space-y-6">
      <!-- URL Input -->
      <div class="space-y-3">
        <label class="block text-xs text-[#666] uppercase tracking-[0.2em]"
          >应用地址</label
        >
        <YGInput 
          v-model:value="form.key" 
          placeholder="请输入网页URL..." 
          class="w-full" 
        />
      </div>

      <!-- Name Input -->
      <div class="space-y-3">
        <label class="block text-xs text-[#666] uppercase tracking-[0.2em]"
          >应用名称</label
        >
        <YGInput 
          v-model:value="form.name" 
          placeholder="请输入应用名称..." 
          class="w-full" 
        />
      </div>

      <!-- Icon Input -->
      <div class="space-y-3">
        <label class="block text-xs text-[#666] uppercase tracking-[0.2em]"
          >应用图标</label
        >
        <YGInput
          v-model:value="form.icon"
          placeholder="请输入图标URL..."
          class="w-full"
          type="textarea"
        />
      </div>

      <!-- Execute Button -->
      <YGButton 
        @click="confirm" 
        :loading="addLoading"
        class="w-full py-4 !bg-[#111] !border-[#333] !text-white !uppercase !tracking-[0.3em] !text-sm hover:!bg-white hover:!text-black transition-all duration-300 active:scale-[0.99] mt-4"
      > 
        确定 
      </YGButton>
    </div>
  </div>
</template>

<script setup lang="ts">
import { addApp, editApp } from "@/api/app";
import YGButton from "@/components_ui/YGButton.vue";
import YGInput from "@/components_ui/YGInput.vue";
import useApp from "@/store/app";
import { onMounted, ref } from "vue";

const props = defineProps<{
  formData?: any;
}>();
const emit = defineEmits(["close"]);

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
      .then(() => {
        emit("close");
      })
      .finally(() => {
        addLoading.value = false;
      });
  } else {
    addApp(form.value)
      .then(() => {
        emit("close");
      })
      .finally(() => {
        addLoading.value = false;
      });
  }
};

const setForm = () => {
  form.value.id = props.formData.id;
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
  if (props.formData) {
    setForm();
  }
});

defineExpose({
  clear,
});
</script>
