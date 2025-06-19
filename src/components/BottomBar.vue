<template>
  <Draggable v-model:list="list" class="gap-x-2 h-full items-end">
    <template #default="item">
      <div class="w-12 h-12 bg-[rgba(0,0,0,0.5)] rounded-lg cursor-pointer select-none">
        {{ item.data }}
      </div>
    </template>
  </Draggable>
</template>

<script setup lang="ts">
import Draggable from "@/components/public/Draggable.vue";
import { ref } from "vue";
const list = ref([{}, {}, {}, {}, {}, {}, {}, {}, {}, {}]);
</script>
