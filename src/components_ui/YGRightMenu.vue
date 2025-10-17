<template>
  <div class="relative" @contextmenu.prevent="contextMenu">
    <slot />
    <!-- <div
      tabindex="0"
      ref="optionBoxRef"
      @blur="optionBoxBlur"
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
    </div> -->
  </div>
</template>

<script setup lang="ts">
import { createApp, h, nextTick, ref } from "vue";
import BaseCover from "./BaseCover";

const props = defineProps<{
  options: {
    label: string;
    value?: string;
  }[];
}>();
const emits = defineEmits(["optionClick"]);

const optionBoxRef = ref();
const showOption = ref(false);

const contextMenu = (e) => {
  const x = e.clientX;
  const y = e.clientY;
  const baseCover = new BaseCover();
  const com = createApp({
    setup: () => {
      return () =>
        h(
          "div",
          {
            tabindex: 0,
            ref: optionBoxRef,
            onBlur: optionBoxBlur,
            class: [
              "transition-all focus-visible:outline-none absolute bottom-[calc(100%+10px)] bg-[var(--yg-bg-color)] rounded-lg",
              showOption.value ? "visible opacity-100" : "invisible opacity-0",
            ],
            style: {
              left: `${x}px`,
              top: `${y}px`,
            },
          },
          props.options.map((item, index) =>
            h(
              "div",
              {
                key: index,
                class:
                  "hover:!text-[var(--yg-color)] transition-all text-white text-nowrap cursor-pointer text-xs py-1 px-4",
                onClick: (e) => {
                  e.stopPropagation();
                  emits("optionClick", item);
                },
              },
              item.label
            )
          )
        );
    },
  });
  baseCover.open(com);
  // showOption.value = true;
  // setTimeout(() => {
  //   optionBoxRef.value.focus();
  // }, 30);
};

const optionBoxBlur = () => {
  showOption.value = false;
};
</script>
