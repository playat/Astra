import { createVNode, defineComponent, h, onMounted, ref } from "vue";
import BaseCover from "./BaseCover.js";

interface RightMenuOptions {
  list: {
    label: string;
    value?: string;
  }[];
  x: number;
  y: number;
}

class RightMenu extends BaseCover {
  private options: RightMenuOptions;
  private rightMenuRef = ref();
  constructor(options: RightMenuOptions) {
    super();
    this.close = this.close.bind(this);
    this.onOptionClick = this.onOptionClick.bind(this);
    this.key = `right-menu-${Math.random().toString(36).slice(2)}`;
    this.options = options;
  }

  onOptionClick(item: RightMenuOptions["list"][number]) {}

  createCom() {
    return defineComponent(() => {
      const menuX = ref(this.options.x);
      const menuY = ref(this.options.y);

      onMounted(() => {
        if (this.rightMenuRef.value) {
          const el = this.rightMenuRef.value as HTMLElement;
          const { innerWidth, innerHeight } = window;
          const { offsetWidth, offsetHeight } = el;

          // Check right boundary
          if (menuX.value + offsetWidth > innerWidth) {
            menuX.value = innerWidth - offsetWidth - 10;
          }
          // Check bottom boundary
          if (menuY.value + offsetHeight > innerHeight) {
            menuY.value = innerHeight - offsetHeight - 10;
          }
          // Check left boundary
          if (menuX.value < 0) {
            menuX.value = 10;
          }
          // Check top boundary
          if (menuY.value < 0) {
            menuY.value = 10;
          }

          this.rightMenuRef.value.focus();
        }
      });
      return () =>
        h(
          "div",
          {
            ref: (el: HTMLElement) => {
              this.rightMenuRef.value = el;
            },
            tabindex: 0,
            class: [
              "transition-all focus-visible:outline-none absolute bg-[#111] border border-[#333] min-w-[140px] z-[9999] shadow-xl",
            ],
            style: {
              left: `${menuX.value}px`,
              top: `${menuY.value}px`,
            },
            onBlur: this.close,
            onKeydown: (e: KeyboardEvent) => {
              if (e.key === "Escape") {
                this.close();
              }
            },
          },
          this.options.list.map((item, index) =>
            h(
              "div",
              {
                key: index,
                class:
                  "flex items-center px-4 py-3 text-white uppercase tracking-[0.2em] text-xs transition-all duration-200 cursor-pointer border-b border-[#333] last:border-b-0 hover:bg-white hover:text-black active:scale-[0.99]",
                onClick: (e) => {
                  e.stopPropagation();
                  this.onOptionClick(item);
                  this.close();
                },
              },
              item.label
            )
          )
        );
    });
  }

  open() {
    const com = this.createCom();
    this.insert(createVNode(com, { key: this.key }));
  }
}

export default RightMenu;
