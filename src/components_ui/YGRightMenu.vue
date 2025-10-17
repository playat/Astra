<template>
  <div class="relative" @contextmenu.prevent="contextMenu">
    <slot />
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
            class: [
              "transition-all focus-visible:outline-none absolute bg-[var(--yg-bg-color)] rounded-lg",
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
};
</script>
