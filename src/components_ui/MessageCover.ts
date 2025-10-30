import { createVNode, defineComponent, Fragment, h, render, VNode } from "vue";
import BaseCover from "./BaseCover.js";
import { ref } from "vue";

let msgTarget: HTMLElement = null;
const msgList = ref<VNode[]>([]);

/**
 * 创建消息通用挂载目标
 */
const createMask = () => {
  msgTarget = document.createElement("div");
  msgTarget.classList.add(
    "fixed",
    "top-0",
    "left-1/2",
    "-translate-x-1/2",
    "-translate-y-1/2",
    "top-8",
    "w-max",
    "flex",
    "items-center",
    "gap-3",
    "visible",
    "z-[1000]"
  );
  msgTarget.id = "_msgTarget";
  document.body.appendChild(msgTarget);
};

class MessageCover extends BaseCover {
  constructor() {
    super();
    this.key = `base-cover-message-${Math.random().toString(36).slice(2)}`;
  }

  createCom() {
    return defineComponent(() => {
      return () =>
        msgList.value.length > 1
          ? h(
              "div",
              {
                class: "w-[30px] h-[30px] bg-neutral-950 text-xs text-white",
              },
              "..."
            )
          : null;
    });
  }
  /**
   * 挂载组件
   * @param node 被渲染的虚拟dom
   */
  insert(node: VNode) {
    console.log(1);

    if (!msgTarget) {
      createMask();
    }
    const com = this.createCom();
    // msgTarget.classList.replace("invisible", "visible");
    msgList.value = [...msgList.value, node];
    render(h(Fragment, null, [msgList.value[0], createVNode(com)]), msgTarget);
  }
}

export default MessageCover;
