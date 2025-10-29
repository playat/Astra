import { createVNode, defineComponent, h, onMounted, ref } from "vue";
import BaseCover, { insert } from "./BaseCover.js";
import gsap from "gsap";

interface MessageOptions {
  message: string;
}

class Message extends BaseCover {
  private options: MessageOptions;
  private visible = ref(false);
  private _messageRef = ref();

  constructor(options: MessageOptions) {
    super();
    this.close = this.close.bind(this);
    this.visibleFn = this.visibleFn.bind(this);
    this.options = options;
    this.key = `message-${Math.random().toString(36).slice(2)}`;
  }

  visibleFn() {
    const autoWhite = this._messageRef.value.offsetWidth;
    gsap.fromTo(
      this._messageRef.value,
      {
        width: 16,
        height: 16,
        ease: "power2.out",
      },
      {
        width: autoWhite + 32,
        height: 30,
        ease: "power2.out",
      }
    );
  }

  hiddenFn() {
    return gsap.to(this._messageRef.value, {
      width: 16,
      height: 16,
      padding: 0,
      ease: "power2.out",
    });
  }

  createCom() {
    return defineComponent(() => {
      onMounted(this.visibleFn);
      return () =>
        h(
          "div",
          {
            ref: (el: HTMLElement) => {
              this._messageRef.value = el;
            },
            class: [
              "fixed flex items-center justify-center whitespace-nowrap top-8 overflow-hidden text-white left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-neutral-950 text-xs",
            ],
            onClick: this.close,
          },
          this.options.message
        );
    });
  }

  open() {
    const com = this.createCom();
    insert(createVNode(com, { key: this.key }));
  }

  close() {
    this.hiddenFn().then(() => {
      super.close();
    });
  }
}

export default Message;
