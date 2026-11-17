import { Component, createVNode, defineComponent, h, onMounted, onUnmounted, ref } from "vue";
import BaseCover from "./BaseCover.js";
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
  /** 关闭动画进行中，避免 ResizeObserver 抢位置 */
  private _closing = false;

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
    this._dialogRef.value.style.transition = "none";
    this._dialogRef.value.style.transform = "none";
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

  // ── 打开动画：3D 轻翻 + 缩放上浮淡入，配合面板扫光 ──

  private _visibleFn = () => {
    const el = this._dialogRef.value;
    if (!el) return;

    this._closing = false;

    // 直接落到最终位置，transform 只做入场变换
    const { top, left } = this._getTargetPos(el);
    gsap.set(el, {
      top,
      left,
      xPercent: 0,
      yPercent: 0,
      transformOrigin: "50% 50%",
    });

    // 只用 2D transform：3D 变换会让后代的 backdrop-filter 采样异常
    gsap.fromTo(
      el,
      { scale: 0.9, y: 18, opacity: 0 },
      {
        scale: 1,
        y: 0,
        opacity: 1,
        duration: 0.44,
        ease: "expo.out",
        overwrite: "auto",
        clearProps: "transform",
      }
    );

    this._playSheen(el);
  };

  /** 面板上扫过一道高光，纯 CSS 动画，动画结束自动移除类 */
  private _playSheen = (el: HTMLElement) => {
    el.classList.remove("is-entering");
    void el.offsetWidth; // 强制重排，保证重复打开时动画能重放
    el.classList.add("is-entering");
    window.setTimeout(() => el.classList.remove("is-entering"), 1000);
  };

  // ── 关闭动画：反向变换后淡出 ──

  protected hiddenFn = () => {
    const el = this._dialogRef.value;
    if (!el) {
      this.close();
      return;
    }
    this._closing = true;
    el.classList.remove("is-entering");
    gsap.killTweensOf(el);

    gsap.to(el, {
      scale: 0.94,
      y: 8,
      rotateX: 6,
      opacity: 0,
      duration: 0.2,
      ease: "power2.in",
      onComplete: () => this.close(),
    });
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

        // 尺寸变化时（图片/字体加载完成）重新对齐到目标位置，拖拽过或正在关闭则不处理
        if (self._dialogRef.value) {
          resizeObserver = new ResizeObserver(() => {
            const el = self._dialogRef.value;
            if (el && !self._hasMoved && !self._closing) {
              self._applyPosition(el);
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
            class: "dialog-shell fixed min-w-75 max-w-11/12",
            // 首帧先隐藏，等 gsap 接管后再显示，避免在左上角闪一下
            style: { opacity: 0 },
            onClick: (e: Event) => e.stopPropagation(),
          },
          [
            h(
              "div",
              { class: "dialog-panel flex flex-col" },
              [
                h(
                  "div",
                  {
                    class: "h-5 w-full border-b border-white/10 px-1 flex items-center select-none",
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
