import {
  Component,
  createApp,
  createVNode,
  defineComponent,
  h,
  onMounted,
  ref,
} from "vue";
import BaseCover from "./BaseCover.js";
import useApp from "@/store/app.js";
import CloseSvg from "@/assets/svg/close.svg";
interface DialogOption {
  component: Component;
}

class CoverDailog extends BaseCover {
  private options: DialogOption;
  private visible = ref(false);
  private from: { x: number; y: number } = { x: 0, y: 0 };
  private _dialogRef = ref();

  constructor(options: DialogOption) {
    super();
    this.options = options;
    this.key = `dialog_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  private setPosition = (x, y) => {
    this._dialogRef.value.style.top = `${y}px`;
    this._dialogRef.value.style.left = `${x}px`;
  };

  private visibleFn = () => {
    this.visible.value = true;
    const appStore = useApp();
    this.from = { ...appStore.globlePosition };
    this.setPosition(this.from.x, this.from.y);
    setTimeout(() => {
      this._dialogRef.value.classList.remove("scale-50");
      this._dialogRef.value.classList.add(
        "transition-all",
        "duration-300",
        "opacity-100",
        "scale-100",
      );
      this.setPosition(window.innerWidth / 2, window.innerHeight / 2);
    }, 100);
  };

  private hiddenFn = () => {
    this.visible.value = false;
    this._dialogRef.value.classList.replace("scale-100", "scale-50");
    this._dialogRef.value.classList.replace("opacity-100", "opacity-0");
    this.setPosition(this.from.x, this.from.y);
    setTimeout(() => {
      this._dialogRef.value.classList.remove("transition-all", "duration-300");
      this.close();
    }, 300);
    this.from = { x: 0, y: 0 };
  };

  createCom() {
    return defineComponent(() => {
      onMounted(this.visibleFn);
      return () =>
        h(
          "div",
          {
            ref: (el: HTMLElement) => {
              this._dialogRef.value = el;
            },
            class: [
              "fixed min-w-[300px] max-w-11/12 bg-[var(--yg-bg-color)] rounded-md flex flex-col overflow-hidden scale-0 -translate-x-1/2 -translate-y-1/2",
              this.visible ? "visible opacity-100" : "opacity-0 invisible",
            ],
            onClick: (e) => e.stopPropagation(),
          },
          [
            h(
              "div",
              {
                class: "flex items-center px-1 h-5 border-b",
              },
              [
                h("div", {
                  className: "w-3 h-3 cursor-pointer rounded-full bg-[#ff3b30]",
                  onClick: this.hiddenFn,
                  onTouchend: this.hiddenFn,
                }),
              ],
              // [
              //   h("img", {
              //     class: "w-4 h-4 cursor-pointer",
              //     src: CloseSvg,
              //     onClick: this.hiddenFn,
              //   }),
              // ],
            ),
            h(this.options.component),
          ],
        );
    });
  }

  open() {
    const com = this.createCom();
    this.insert(createVNode(com, { key: this.key }));
  }
}

export default CoverDailog;
