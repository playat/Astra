<template>
  <div class="text-white flex flex-col w-[400px] bg-black border border-[#333]">
    <!-- Header -->
    <div
      class="border-b border-[#333] px-6 py-4 flex items-center justify-between"
    >
      <div class="flex items-center gap-2">
        <div class="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        <span class="text-sm font-bold tracking-[0.2em] uppercase"
          >{{ title }}</span
        >
      </div>
      <div class="flex items-center gap-4">
        <div class="text-[10px] text-[#666] font-mono">SYS.MSG.V1.0</div>
      </div>
    </div>

    <div class="p-8 space-y-6">
      <!-- Message Content -->
      <div class="space-y-3">
        <div class="text-sm text-[#ccc] leading-relaxed">
          {{ message }}
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-4">
        <YGButton 
          @click="handleCancel" 
          block
          variant="outline"
        > 
          取消 
        </YGButton>
        <YGButton 
          @click="handleConfirm" 
          :loading="confirmLoading"
          block
        > 
          确定 
        </YGButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import YGButton from "@/components_ui/YGButton.vue";
import { ref } from "vue";

const props = defineProps<{
  title?: string;
  message: string;
}>();

const emit = defineEmits(["cancel", "confirm"]);

const confirmLoading = ref(false);

const handleCancel = () => {
  emit("cancel");
};

const handleConfirm = async () => {
  confirmLoading.value = true;
  try {
    emit("confirm");
  } finally {
    confirmLoading.value = false;
  }
};
</script>
