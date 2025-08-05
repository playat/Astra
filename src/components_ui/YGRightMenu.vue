<template>
  <div class="relative" @contextmenu.prevent="contextMenu">
    <slot />
    <div
      tabindex="0"
      ref="optionBoxRef"
      @blur="optionBoxBlur"
      @focus="() => console.log('focus')"
      :class="showOption ? 'visible opacity-100' : 'invisible opacity-0'"
      class="transition-all focus-visible:outline-none absolute left-1/2 -translate-x-1/2 bottom-[calc(100%+10px)] bg-[var(--yg-bg-color)] rounded-lg"
    >
      <div
        class="hover:!text-[var(--yg-color)] transition-all text-white text-nowrap cursor-pointer text-xs py-1 px-4"
        v-for="(item, index) in options"
        :key="index"
        @click.stop="$emit('optionClick', item)"
      >
        {{ item.label }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref } from "vue";

defineProps<{
  options: {
    label: string;
    value?: string;
  }[];
}>();
defineEmits(["optionClick"]);

const optionBoxRef = ref();
const showOption = ref(false);

const contextMenu = (e) => {
  showOption.value = true;
  console.log(optionBoxRef.value);
  setTimeout(() => {
    optionBoxRef.value.focus();
  }, 30);
};

const optionBoxBlur = () => {
  console.log("blur");
  showOption.value = false;
};
</script>
