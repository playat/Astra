<template>
  <div class="text-white flex flex-col w-[500px] bg-black border border-[#333]">
    <!-- Header -->
    <div
      class="border-b border-[#333] px-6 py-4 flex items-center justify-between"
    >
      <div class="flex items-center gap-2">
        <div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        <span class="text-sm font-bold tracking-[0.2em] uppercase"
          >生理记录</span
        >
      </div>
      <div class="flex items-center gap-4">
        <div class="text-[10px] text-[#666] font-mono">SYS.PHY.V1.0</div>
      </div>
    </div>

    <div class="p-8 space-y-8">
      <!-- Section 1: Time Select -->
      <div class="space-y-3">
        <label class="block text-xs text-[#666] uppercase tracking-[0.2em]"
          >选择时间</label
        >
        <div class="w-full border border-[#333] bg-[#0f0f0f] p-4 flex justify-center">
          <YGDatePicker v-model="form.happen" />
        </div>
      </div>

      <!-- Execute Button -->
      <YGButton 
        @click="confirm" 
        :loading="loading"
        block
      > 
        确定 
      </YGButton>
    </div>
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
const emits = defineEmits(["close"]);
const confirm = () => {
  if (!form.value.happen) {
    return;
  }
  loading.value = true;
  addPhysiology(form.value)
    .then(() => {
      emits("close");
    })
    .finally(() => {
      form.value.happen = "";
      loading.value = false;
    });
};

</script>
