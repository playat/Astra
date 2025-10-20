import { Component, createApp, createVNode, h, onMounted, ref } from "vue";
import BaseCover from "./BaseCover.js";
import useApp from "@/store/app.js";
import CloseSvg from "@/assets/svg/close.svg";
interface DialogOption {
  component: Component;
}

class Dailog extends BaseCover {
  private _key;
  private visible = ref(false);
  private from: { x: number; y: number } = { x: 0, y: 0 };
  private _dialogRef = ref();

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
        "scale-100"
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
      this.close(this._key);
    }, 300);
    this.from = { x: 0, y: 0 };
  };

  createCom(option: DialogOption) {
    onMounted(this.visibleFn);
    return () =>
      h(
        "div",
        {
          ref: (el: HTMLElement) => {
            this._dialogRef.value = el;
          },
          class: [
            "fixed min-w-[300px] max-w-11/12 bg-[var(--yg-bg-color)] p-3 rounded-md flex flex-col gap-3 overflow-hidden scale-0 -translate-x-1/2 -translate-y-1/2",
            this.visible ? "visible opacity-100" : "opacity-0 invisible",
          ],
          onClick: (e) => e.stopPropagation(),
        },
        [
          h(
            "div",
            {
              class: "flex items-center justify-end",
            },
            [
              h("img", {
                class: "w-4 h-4 cursor-pointer",
                src: CloseSvg,
                onClick: this.hiddenFn,
              }),
            ]
          ),
          h(option.component),
        ]
      );
  }

  open(option: DialogOption) {
    const com = this.createCom(option);
    this._key = `cover_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
    const vnode = createVNode(com, { key: this._key });
    this.insert(vnode);
  }
}

export default Dailog;
