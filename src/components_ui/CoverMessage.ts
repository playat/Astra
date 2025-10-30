import { createVNode, defineComponent, h, onMounted, ref } from "vue";
import gsap from "gsap";
import MessageCover from "./MessageCover.js";

interface MessageOptions {
  message: string;
}

class Message extends MessageCover {
  private options: MessageOptions;
  private visible = ref(false);
  private _messageRef = ref();

  constructor(options: MessageOptions) {
    super();
    this.close = this.close.bind(this);
    this.visibleFn = this.visibleFn.bind(this);
    this.hiddenFn = this.hiddenFn.bind(this);
    this.options = options;
    this.key = `message-${Math.random().toString(36).slice(2)}`;
  }

  visibleFn() {
    this.visible.value = true;
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
    this.visible.value = false;
    return gsap.to(this._messageRef.value, {
      width: 16,
      height: 16,
      padding: 0,
      ease: "power2.out",
    });
  }

  createCom() {
    return defineComponent(() => {
      let timer;
      onMounted(() => {
        this.visibleFn();
        // timer = setTimeout(() => {
        //   this.close();
        //   clearTimeout(timer);
        // }, 1500);
      });
      return () =>
        h(
          "div",
          {
            ref: (el: HTMLElement) => {
              this._messageRef.value = el;
            },
            class: [
              "flex items-center cursor-pointer justify-center whitespace-nowrap overflow-hidden text-white rounded-full bg-neutral-950 text-xs",
              this.visible.value ? "opacity-100" : "opacity-0",
            ],
            onClick: this.close,
          },
          this.options.message
        );
    });
  }

  open() {
    const com = this.createCom();
    super.insert(createVNode(com, { key: this.key }));
  }

  close() {
    this.hiddenFn().then(() => {
      super.close();
    });
  }
}

export default Message;
