import { createVNode, defineComponent, Fragment, h, render, VNode } from "vue";
import BaseCover from "./BaseCover.js";
import { ref } from "vue";
import gsap from "gsap";
import CoverMessage from "./CoverMessage.js";

let msgTarget: HTMLElement = null;
const msgList = ref<CoverMessage[]>([]);

/**
 * 创建消息通用挂载目标
 */
const createMask = () => {
  msgTarget = document.createElement("div");
  msgTarget.classList.add(
    "fixed",
    "left-1/2",
    "-translate-x-1/2",
    "-translate-y-1/2",
    "transition-all",
    "top-6",
    "w-max",
    "h-[30px]",
    "flex",
    "items-center",
    "gap-3",
    "visible",
    "z-[1000]"
  );
  msgTarget.id = "_msgTarget";
  document.body.appendChild(msgTarget);
};
const createDotCom = () => {
  return defineComponent(() => {
    return () =>
      msgList.value.length > 1
        ? h(
            "div",
            {
              key: "dot",
              class:
                "w-[30px] h-[30px] bg-neutral-950 text text-white rounded-full flex items-center justify-center",
            },
            "···"
          )
        : null;
  });
};
/**
 * 挂载组件
 * @param node 被渲染的虚拟dom
 */
export const insert = (msg: CoverMessage) => {
  if (!msgTarget) {
    createMask();
  }
  if (msgList.value[0]) {
    msgList.value[0].hiddenFn().then(() => {
      msgList.value.unshift(msg);
      render(
        h(Fragment, null, [msgList.value[0].node, createVNode(createDotCom())]),
        msgTarget
      );
      msg.visibleFn();
    });
  } else {
    msgList.value.unshift(msg);
    render(msg.node, msgTarget);
    msg.visibleFn();
  }
};
