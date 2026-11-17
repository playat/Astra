import {
  Component,
  createVNode,
  defineComponent,
  h,
  onMounted,
  onUnmounted,
  ref,
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
  /** 点击位置（动画起点锚点），未捕获到点击时为 null */
  private _anchor: { x: number; y: number } | null = null;
  /** 弹窗最终位置的中心，相对点击位置的偏移量 */
  private _offset = { x: 0, y: 0 };
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

  // ── 打开动画：先把元素摆到最终位置，再用 transform 从点击点「生长」出来 ──

  private _visibleFn = () => {
    const el = this._dialogRef.value;
    if (!el) return;

    this._closing = false;
    const appStore = useApp();
    const { x, y } = appStore.globlePosition;
    this._anchor = x > 0 || y > 0 ? { x, y } : null;

    // 1. 直接落到最终位置（不含位移动画，避免拖动 top/left 引起的抖动）
    const { top, left } = this._getTargetPos(el);
    gsap.set(el, {
      top,
      left,
      xPercent: 0,
      yPercent: 0,
      x: 0,
      y: 0,
      scale: 1,
      opacity: 0,
      transformOrigin: "50% 50%",
    });

    // 2. 计算点击点相对弹窗中心的偏移
    const w = el.offsetWidth;
    const h = el.offsetHeight;
    const offset = {
      x: this._anchor ? this._anchor.x - (left + w / 2) : 0,
      y: this._anchor ? this._anchor.y - (top + h / 2) : 12,
    };
    this._offset = offset;

    // 3. 从点击点放大 + 淡入；没有点击坐标时退化为轻微上浮淡入
    const scales = this._anchor ? 0.5 : 0.96;
    gsap.fromTo(
      el,
      { x: offset.x, y: offset.y, scale: scales, opacity: 0 },
      {
        x: 0,
        y: 0,
        scale: 1,
        opacity: 1,
        duration: this._anchor ? 0.46 : 0.26,
        ease: this._anchor ? "expo.out" : "power2.out",
        overwrite: "auto",
      }
    );
  };

  // ── 关闭动画：沿原路缩回点击位置 ──

  protected hiddenFn = () => {
    const el = this._dialogRef.value;
    if (!el) {
      this.close();
      return;
    }
    this._closing = true;
    gsap.killTweensOf(el);

    // 被拖动过：原地淡出，不强行飞回鼠标位置
    if (this._hasMoved) {
      gsap.to(el, {
        scale: 0.96,
        opacity: 0,
        duration: 0.2,
        ease: "power2.in",
        onComplete: () => this.close(),
      });
      return;
    }

    gsap.to(el, {
      x: this._offset.x,
      y: this._offset.y,
      scale: this._anchor ? 0.5 : 0.96,
      opacity: 0,
      duration: 0.26,
      ease: "power3.in",
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
            class: "fixed min-w-75 max-w-11/12",
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
