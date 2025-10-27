import { createVNode, defineComponent, h } from "vue";
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
  key;
  private options: RightMenuOptions;

  constructor(options: RightMenuOptions) {
    super();
    this.key = `right-menu-${Math.random().toString(36).slice(2)}`;
    this.options = options;
  }

  onOptionClick(item: RightMenuOptions["list"][number]) {}

  createCom() {
    return defineComponent(() => {
      return () =>
        h(
          "div",
          {
            class: [
              "transition-all focus-visible:outline-none absolute bg-[var(--yg-bg-color)] rounded-lg",
            ],
            style: {
              left: `${this.options.x}px`,
              top: `${this.options.y}px`,
            },
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
    super.insert(createVNode(com, { key: this.key }));
  }
}

export default RightMenu;
