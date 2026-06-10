import {
  Component,
  createVNode,
  defineComponent,
  h,
  onMounted,
  onUnmounted,
  ref,
  resolveDirective,
  withDirectives,
} from "vue";
import BaseCover from "./BaseCover.js";
import useApp from "@/store/app.js";
import MoveSvg from "@/assets/svg/move.svg";
import gsap from "gsap";

interface DialogOption {
  component: Component;
  draggable?: boolean;
  position?: "center" | "top-left" | "top-right" | "bottom-left" | "bottom-right" | { top: number; left: number };
}

class CoverDialog extends BaseCover {
  private options: DialogOption;
  private _dialogRef = ref<HTMLElement>();
  private _from: { x: number; y: number } = { x: 0, y: 0 };

  // drag state
  private _isDown = false;
  private _baseRect: DOMRect;
  private _baseClientX: number;
  private _baseClientY: number;
  private _hasMoved = false;

  private get draggable(): boolean {
    return !!this.options.draggable;
  }

  constructor(options: DialogOption) {
    super();
    this.options = options;
    this.key = `dialog_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

    this._onMouseMove = this._onMouseMove.bind(this);
    this._onMouseUp = this._onMouseUp.bind(this);
    document.addEventListener("mousemove", this._onMouseMove);
    document.addEventListener("touchmove", this._onMouseMove);
  }

  // ── drag handlers ──

  private _onMouseDown(e: MouseEvent & TouchEvent) {
    if (!this.draggable) return;
    e.preventDefault();
    this._hasMoved = true;
    gsap.killTweensOf(this._dialogRef.value);
    const target = e.type === "touchstart" ? e.touches[0] : e;
    this._isDown = true;
    this._baseRect = this._dialogRef.value.getBoundingClientRect();
    this._baseClientX = target.clientX;
    this._baseClientY = target.clientY;
  }

  private _onMouseMove(e: MouseEvent & TouchEvent) {
    if (!this._isDown) return;
    e.stopPropagation();
    const target = e.type === "touchmove" ? e.touches[0] : e;
    this._dialogRef.value.style.top = `${this._baseRect.top + (target.clientY - this._baseClientY)}px`;
    this._dialogRef.value.style.left = `${this._baseRect.left + (target.clientX - this._baseClientX)}px`;
    this._dialogRef.value.style.transform = "none";
  }

  private _onMouseUp() {
    this._isDown = false;
  }

  // ── position helper ──

  private _getTargetPos(el: HTMLElement): { top: number; left: number } {
    const pos = this.options.position;
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    if (!pos || pos === "center") {
      return { top: window.innerHeight / 2 - h / 2, left: window.innerWidth / 2 - w / 2 };
    }
    if (typeof pos === "object") return pos;
    const map: Record<string, { top: number; left: number }> = {
      "top-left": { top: 20, left: 20 },
      "top-right": { top: 20, left: window.innerWidth - w - 20 },
      "bottom-left": { top: window.innerHeight - h - 20, left: 20 },
      "bottom-right": { top: window.innerHeight - h - 20, left: window.innerWidth - w - 20 },
    };
    return map[pos] || { top: window.innerHeight / 2 - h / 2, left: window.innerWidth / 2 - w / 2 };
  }

  private _applyPosition(el: HTMLElement) {
    const { top, left } = this._getTargetPos(el);
    gsap.set(el, { top, left, xPercent: 0, yPercent: 0 });
  }

  // ── 立即将元素定位到点击位置并隐藏（防止闪烁）──

  private _initPosition = () => {
    const el = this._dialogRef.value;
    const appStore = useApp();
    this._from = { ...appStore.globlePosition };
    gsap.set(el, { top: this._from.y, left: this._from.x, scale: 0, opacity: 0, translateX: "-50%", translateY: "-50%" });
  };

  // ── open / close animations ──

  private _visibleFn = () => {
    const el = this._dialogRef.value;
    this._initPosition()
    if (!this._hasMoved) {
      const { top, left } = this._getTargetPos(el);
      gsap.to(el, { top, left, scale: 1, opacity: 1, duration: 0.3, ease: "power2.out", translateX: "0", translateY: "0" });
    } else {
      gsap.to(el, { scale: 1, opacity: 1, duration: 0.3, ease: "power2.out", translateX: "0", translateY: "0" });
    }
  };

  protected hiddenFn = () => {
    const el = this._dialogRef.value;
    gsap.killTweensOf(el);
    gsap.to(el, {
      top: this._from.y,
      left: this._from.x,
      scale: 0,
      opacity: 0,
      duration: 0.3,
      ease: "power2.in",
      translateX: "-50%", translateY: "-50%",
      onComplete: () => {
        this.close();
      },
    });
    this._from = { x: 0, y: 0 };
  };

  // ── render ──

  createCom() {
    const self = this;
    return defineComponent(() => {
      let resizeObserver: ResizeObserver;

      const handleKeydown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          self.hiddenFn();
        }
      };

      onMounted(() => {
        self._visibleFn();
        document.addEventListener("keydown", handleKeydown);

        if (self.draggable && self._dialogRef.value) {
          resizeObserver = new ResizeObserver(() => {
            if (!self._hasMoved && self._dialogRef.value) {
              self._applyPosition(self._dialogRef.value);
            }
          });
          resizeObserver.observe(self._dialogRef.value);
        }
      });

      onUnmounted(() => {
        resizeObserver?.disconnect();
        document.removeEventListener("keydown", handleKeydown);
        document.removeEventListener("mousemove", self._onMouseMove);
        document.removeEventListener("touchmove", self._onMouseMove);
        document.removeEventListener("mouseup", self._onMouseUp);
        document.removeEventListener("touchend", self._onMouseUp);
      });

      return () =>
        h(
          "div",
          {
            ref: (el: HTMLElement) => {
              self._dialogRef.value = el;
            },
            class: "fixed min-w-75 max-w-11/12",
            onClick: (e: Event) => e.stopPropagation(),
          },
          [
            withDirectives(
              h(
                "div",
                { class: "flex flex-col" },
                [
                  h(
                    "div",
                    {
                      class: "h-5 border-b border-white/10 px-1 flex items-center select-none",
                      style: self.draggable ? "cursor: move" : undefined,
                      onMousedown: (e: MouseEvent & TouchEvent) => self._onMouseDown(e),
                      onMouseup: self._onMouseUp,
                      onTouchstart: (e: MouseEvent & TouchEvent) => self._onMouseDown(e),
                      onTouchend: self._onMouseUp,
                    },
                    [
                      h("div", {
                        className: "w-3 h-3 cursor-pointer rounded-full bg-[#ff3b30]",
                        onClick: self.hiddenFn,
                        onTouchend: self.hiddenFn,
                      }),
                      self.draggable
                        ? h("img", { src: MoveSvg, alt: "", className: "w-3 h-3 ml-auto" })
                        : null,
                    ],
                  ),
                  h(self.options.component, { onClose: self.hiddenFn }),
                ],
              ),
              [[resolveDirective("liquid-glass")!, { borderRadius: 8, width: 'auto', height: 'auto' }]],
            ),
          ],
        );
    });
  }

  open() {
    const com = this.createCom();
    this.insert(createVNode(com, { key: this.key }));
  }
}

export default CoverDialog;
