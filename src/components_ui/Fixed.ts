import { Component, createApp, h, ref } from "vue";
import BaseCover from "./BaseCover.js";
import MoveSvg from "@/assets/svg/move.svg";
import CloseSvg from "@/assets/svg/close.svg";

interface FixedOption {
  component: Component;
}

class Fixed extends BaseCover {
  private _top = ref(50);
  private _left = ref(50);
  private _baseRect: DOMRect;
  private _isDown = false;
  private _baseClientX;
  private _baseClientY;
  private _fixedRef = ref<HTMLElement>();
  private _rect = {
    width: 0,
    height: 0,
  };

  constructor() {
    super();
    this.mousedown = this.mousedown.bind(this);
    this.mousemove = this.mousemove.bind(this);
    this.mouseUp = this.mouseUp.bind(this);
    this.close = this.close.bind(this);
    document.removeEventListener("mousemove", this.mousemove);
    document.removeEventListener("touchmove", this.mousemove);
    // 避免重复绑定事件监听器
    // if (!document.onmousemove) {
    document.addEventListener("mousemove", this.mousemove);
    // }
    // if(!document.ontouchmove) {
    document.addEventListener("touchmove", this.mousemove);
    // }
  }

  mousedown(e: MouseEvent & TouchEvent) {
    e.preventDefault();
    const target = e.type === "touchstart" ? e.touches[0] : e;
    this._isDown = true;
    this._baseRect = this._fixedRef.value.getBoundingClientRect();
    this._baseClientX = target.clientX;
    this._baseClientY = target.clientY;
  }

  mousemove = (e: MouseEvent & TouchEvent) => {
    e.stopPropagation();
    if (this._isDown) {
      const target = e.type === "touchmove" ? e.touches[0] : e;
      const lastX = this._baseRect.left + (target.clientX - this._baseClientX);
      const lastY = this._baseRect.top + (target.clientY - this._baseClientY);
      // if (lastY < 0) {
      //   this._top.value = 0;
      // } else if (lastY > this._rect.height) {
      //   this._top.value = this._rect.height;
      // } else {
      this._top.value = lastY;
      // }

      // if (lastX < 0) {
      //   this._left.value = 0;
      // } else if (lastX > this._rect.width) {
      //   this._left.value = this._rect.width;
      // } else {
      this._left.value = lastX;
      // }
    }
  };
  mouseUp(e: MouseEvent) {
    this._isDown = false;
  }
  open = (option: FixedOption) => {
    const com = createApp({
      setup: () => {
        const { _top, _left, close } = this;
        return () =>
          h(
            "div",
            {
              className: "fixed bg-black-0.5 rounded-md z-50",
              style: {
                top: `${_top.value}px`,
                left: `${_left.value}px`,
              },
              ref: (el: HTMLElement) => {
                this._fixedRef.value = el;
              },
            },
            [
              h(
                "div",
                {
                  className:
                    "h-5 border-b px-1 flex justify-between cursor-move items-center select-none",
                  onMousedown: this.mousedown,
                  onMouseup: this.mouseUp,
                  onTouchstart: this.mousedown,
                  onTouchend: this.mouseUp,
                },
                [
                  h("img", {
                    src: CloseSvg,
                    alt: "",
                    className: "w-3 h-3 cursor-pointer",
                    onClick: close,
                    onTouchend: close,
                  }),
                  h("img", { src: MoveSvg, alt: "", className: "w-3 h-3" }),
                ]
              ),
              h("div", { className: "p-3" }, h(option.component)),
            ]
          );
      },
    });

    const componentDom = super.open(com) as HTMLElement;
    this._fixedRef.value = componentDom;

    const fixedRect = this._fixedRef.value.getBoundingClientRect();
    this._rect.width = window.innerWidth - fixedRect.width;
    this._rect.height = window.innerHeight - fixedRect.height;
  };

  close() {
    this._baseClientX = undefined;
    this._baseClientY = undefined;
    this._baseRect = undefined;
    this._isDown = false;
    this._top.value = 50;
    this._left.value = 50;
    this._rect.width = 0;
    this._rect.height = 0;
    super.close();
  }
}

export default Fixed;
