import {
  Component,
  createApp,
  createVNode,
  defineComponent,
  h,
  ref,
  RendererNode,
} from "vue";
import BaseCover, { insert } from "./BaseCover.js";
import MoveSvg from "@/assets/svg/move.svg";
import CloseSvg from "@/assets/svg/close.svg";

interface FixedOption {
  component: Component;
}

class Fixed extends BaseCover {
  private options: FixedOption;
  private _top = ref(50);
  private _left = ref(50);
  private _baseRect: DOMRect;
  private _isDown = false;
  private _baseClientX;
  private _baseClientY;
  private _fixedRef = ref<RendererNode>();
  private _rect = {
    width: 0,
    height: 0,
  };

  constructor(options: FixedOption) {
    super();
    this.options = options;
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
    this.key = `fixed_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  mousedown(e: MouseEvent & TouchEvent) {
    e.preventDefault();
    const target = e.type === "touchstart" ? e.touches[0] : e;
    this._isDown = true;
    this._baseRect = this._fixedRef.value.getBoundingClientRect();
    this._baseClientX = target.clientX;
    this._baseClientY = target.clientY;
  }

  mousemove(e: MouseEvent & TouchEvent) {
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
  }
  mouseUp(e: MouseEvent) {
    this._isDown = false;
  }

  createCom() {
    return defineComponent(() => {
      return () =>
        h(
          "div",
          {
            className: "fixed bg-black-0.5 rounded-md z-20 w-max",
            style: {
              top: `${this._top.value}px`,
              left: `${this._left.value}px`,
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
                  onClick: this.close,
                  onTouchend: this.close,
                }),
                h("img", { src: MoveSvg, alt: "", className: "w-3 h-3" }),
              ]
            ),
            h(this.options.component),
          ]
        );
    });
  }

  open = () => {
    const com = this.createCom();

    const vnode = createVNode(com, { key: this.key });
    insert(vnode);
    this._fixedRef.value = vnode.el;

    // this._rect.width = window.innerWidth - fixedRect.width;
    // this._rect.height = window.innerHeight - fixedRect.height;
    setTimeout(() => {
      const fixedRect = this._fixedRef.value.getBoundingClientRect();
      this._left.value = window.innerWidth / 2 - fixedRect.width / 2;
    }, 100);
  };

  close() {
    console.log(this);

    this._baseClientX = undefined;
    this._baseClientY = undefined;
    this._baseRect = undefined;
    this._isDown = false;
    this._top.value = 50;
    this._left.value =
      window.innerWidth / 2 - this._fixedRef.value.offsetWidth / 2;
    // this._rect.width = 0;
    // this._rect.height = 0;
    super.close();
  }
}

export default Fixed;
