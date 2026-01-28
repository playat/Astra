<template>
  <div class="text-white flex flex-col gap-3">
    <div>
      <div class="text-sm">选择时间：</div>
      <YGDatePicker v-model="form.happen" class="mt-3" />
    </div>
    <YGButton @click="confirm" :loading="loading"> 确定 </YGButton>
  </div>
</template>

<script setup lang="ts">
import { addPhysiology } from "@/api/physiology";
import YGButton from "@/components_ui/YGButton.vue";
import YGDatePicker from "@/components_ui/YGDatePicker/index.vue";
import YGInput from "@/components_ui/YGInput.vue";
import { onMounted, ref } from "vue";

const props = defineProps<{
  isToday?: boolean;
}>();
const form = ref({
  happen: "",
});

const loading = ref(false);
const emits = defineEmits(["success"]);
const confirm = () => {
  if (!form.value.happen) {
    return;
  }
  loading.value = true;
  addPhysiology(form.value)
    .then(() => {
      emits("success");
    })
    .finally(() => {
      form.value.happen = "";
      loading.value = false;
    });
};

</script>
