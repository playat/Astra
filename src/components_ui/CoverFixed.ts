import {
  Component,
  createVNode,
  defineComponent,
  h,
  ref,
  RendererNode,
  onMounted,
  onUnmounted,
} from "vue";
import BaseCover from "./BaseCover.js";
import MoveSvg from "@/assets/svg/move.svg";
import CloseSvg from "@/assets/svg/close.svg";

interface FixedOption {
  component: Component;
  position?: "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right" | { top: number; left: number };
}

class CoverFixed extends BaseCover {
  private options: FixedOption;
  private _top = ref(50);
  private _left = ref(50);
  private _baseRect: DOMRect;
  private _isDown = false;
  private _baseClientX;
  private _baseClientY;
  private _fixedRef = ref<RendererNode>();
  private _hasMoved = false;
  private _customPosition?: FixedOption["position"];
  private _rect = {
    width: 0,
    height: 0,
  };

  constructor(options: FixedOption) {
    super();
    this.options = options;
    this._customPosition = options.position;
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
    this._hasMoved = true;
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
      let resizeObserver: ResizeObserver;

      onMounted(() => {
        if (this._fixedRef.value) {
          resizeObserver = new ResizeObserver(() => {
            if (this._hasMoved || !this._fixedRef.value) return;
            const fixedRect = this._fixedRef.value.getBoundingClientRect();
            const w = fixedRect.width;
            const h = fixedRect.height;
            const pos = this._customPosition;
            if (!pos || pos === "center") {
              this._left.value = window.innerWidth / 2 - w / 2;
              this._top.value = window.innerHeight / 2 - h / 2;
            } else if (typeof pos === "object") {
              this._top.value = pos.top;
              this._left.value = pos.left;
            } else {
              const map: Record<string, { top: number; left: number }> = {
                "top-left": { top: 20, left: 20 },
                "top-right": { top: 20, left: window.innerWidth - w - 20 },
                "bottom-left": { top: window.innerHeight - h - 20, left: 20 },
                "bottom-right": { top: window.innerHeight - h - 20, left: window.innerWidth - w - 20 },
              };
              const p = map[pos];
              if (p) {
                this._top.value = p.top;
                this._left.value = p.left;
              }
            }
          });
          resizeObserver.observe(this._fixedRef.value as HTMLElement);
        }
      });

      onUnmounted(() => {
        if (resizeObserver) {
          resizeObserver.disconnect();
        }
      });

      return () =>
        h(
          "div",
          {
            className: "fixed bg-black-0.5 rounded-md z-20 w-max border border-gray-800",
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
                h("div", {
                  className: "w-3 h-3 cursor-pointer rounded-full bg-[#ff3b30]",
                  onClick: this.close,
                  onTouchend: this.close,
                }),
                h("img", { src: MoveSvg, alt: "", className: "w-3 h-3" }),
              ],
            ),
            h(this.options.component, {onClose: this.close}),
          ],
        );
    });
  }

  open = () => {
    const com = this.createCom();

    const vnode = createVNode(com, { key: this.key });
    this.insert(vnode);
  };

  close() {
    console.log(this);

    this._baseClientX = undefined;
    this._baseClientY = undefined;
    this._baseRect = undefined;
    this._isDown = false;
    this._hasMoved = false;
    this._top.value = 50;
    this._left.value =
      window.innerWidth / 2 - this._fixedRef.value.offsetWidth / 2;
    // this._rect.width = 0;
    // this._rect.height = 0;
    super.close();
  }
}

export default CoverFixed;
