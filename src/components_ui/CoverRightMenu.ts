import { createVNode, defineComponent, h, onMounted, ref } from "vue";
import BaseCover, { insert } from "./BaseCover.js";

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
      onMounted(() => {
        if (this.rightMenuRef.value) {
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
              "transition-all focus-visible:outline-none absolute bg-[var(--yg-bg-color)] rounded-lg",
            ],
            style: {
              left: `${this.options.x}px`,
              top: `${this.options.y}px`,
            },
            onBlur: this.close,
          },
          this.options.list.map((item, index) =>
            h(
              "div",
              {
                key: index,
                class:
                  "hover:!text-[var(--yg-color)] transition-all text-white text-nowrap cursor-pointer text-xs py-1 px-4",
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
    insert(createVNode(com, { key: this.key }));
  }
}

export default RightMenu;
