<template>
  <div class="form-container">
    <form @submit.prevent="handleSubmit" class="flex flex-col gap-3">
      <div class="form-item">
        <label for="happen" class="text-sm text-white">发生事件：</label>
        <YGInput
          v-model:value="formData.happen"
          placeholder="请输入发生的事件"
          class="mt-2"
        />
      </div>
      <YGButton type="submit">提交</YGButton>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import YGInput from "@/components_ui/YGInput.vue";
import YGButton from "@/components_ui/YGButton.vue";

const formData = ref({
  happen: "",
});

const handleSubmit = () => {
  // 处理表单提交
  console.log("提交的数据:", formData.value);
};
</script>

<style scoped>
.form-container {
  max-width: 500px;
  margin: 20px auto;
  padding: 20px;
}
</style>
