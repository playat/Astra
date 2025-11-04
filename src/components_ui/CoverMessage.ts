import { createVNode, defineComponent, h, onMounted, ref, VNode } from "vue";
import gsap from "gsap";
import { insert } from "./MessageCover.js";

interface MessageOptions {
  message: string;
}

class Message {
  private options: MessageOptions;
  private visible = ref(false);
  _messageRef = null;
  private key: string;
  node: VNode;

  constructor(options: MessageOptions) {
    this.close = this.close.bind(this);
    this.visibleFn = this.visibleFn.bind(this);
    this.options = options;
    this.key = `message-${Math.random().toString(36).slice(2)}`;
  }

  visibleFn() {
    this.visible.value = true;
    const autoWhite = this._messageRef.offsetWidth;
    gsap.fromTo(
      this._messageRef,
      {
        width: 16,
        height: 16,
        ease: "power2.out",
        duration: 0.5,
        opacity: 0,
      },
      {
        width: autoWhite + 32,
        height: 30,
        ease: "power2.out",
        opacity: 1,
        duration: 0.5,
      }
    );
  }
  hiddenFn() {
    this.visible.value = false;
    return gsap.to(this._messageRef, {
      translateX: 42,
      width: 30,
      height: 30,
      padding: 0,
      ease: "power2.out",
      duration: 0.5,
    });
  }

  createCom() {
    return defineComponent(() => {
      return () =>
        h(
          "div",
          {
            ref: (el: HTMLElement) => {
              this._messageRef = el;
            },
            class: [
              "flex items-center cursor-pointer justify-center whitespace-nowrap overflow-hidden text-white rounded-full bg-neutral-950 text-xs",
            ],
            onClick: this.close,
          },
          this.visible.value ? this.options.message : "···"
        );
    });
  }

  open() {
    this.node = createVNode(this.createCom(), { key: this.key });
    insert(this);
  }

  close() {
    // this.hiddenFn().then(() => {
    //   super.close();
    // });
  }
}

export default Message;
