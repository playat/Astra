<template>
  <div class="relative" ref="selectRef">
    <div
      class="flex items-center gap-2 cursor-pointer select-none"
      @mousedown.prevent
      @click="toggleDropdown"
    >
      <slot name="trigger" :selected="modelValue" />
    </div>
    <Transition name="dropdown">
      <div
        v-if="isOpen"
        class="absolute top-full bg-[#111] border border-[#333] min-w-30 z-999 shadow-xl"
        :style="popperStyle"
      >
        <div
          v-for="item in options"
          :key="item.value"
          class="flex items-center gap-2 px-3 py-2 text-white uppercase tracking-[0.2em] text-xs transition-all duration-200 cursor-pointer border-b border-[#333] last:border-b-0 hover:bg-white hover:text-black"
          :class="{ 'bg-white/10': item.value === modelValue }"
          @mousedown.prevent
          @click="handleSelect(item)"
        >
          <slot name="option" :item="item">
            {{ item.label }}
          </slot>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

interface SelectOption {
  value: string;
  label: string;
  [key: string]: any;
}

const props = withDefaults(defineProps<{
  modelValue: string;
  options: SelectOption[];
  popperStyle?: Partial<CSSStyleDeclaration>;
}>(), {
  popperStyle: () => ({  }),
});

const emit = defineEmits<{
  (e: "update:modelValue", value: string): void;
  (e: "change", value: string): void;
}>();

const isOpen = ref(false);
const selectRef = ref<HTMLElement>();

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const handleSelect = (item: SelectOption) => {
  emit("update:modelValue", item.value);
  emit("change", item.value);
  isOpen.value = false;
};

const handleClickOutside = (e: MouseEvent) => {
  if (selectRef.value && !selectRef.value.contains(e.target as Node)) {
    isOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener("click", handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener("click", handleClickOutside);
});
</script>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
