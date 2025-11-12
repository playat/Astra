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
const createMoreCom = () => {
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

const delay = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};
let isRemoving = false;
const msgRemove = async () => {
  isRemoving = true;
  while (msgList.value[0]) {
    await delay(5000);
    msgList.value.splice(0, 1);
    i--;
  }
  isRemoving = false;
};

let isRunning = false;
let i = 0;
const msgShow = async () => {
  isRunning = true;
  while (msgList.value[i]) {
    const curMsg = msgList.value[i];
    const prevMsg = msgList.value[i - 1];
    // console.log("插入消息", curMsg.options.message);

    if (prevMsg) {
      await prevMsg.hiddenFn();
      render(
        h(Fragment, null, [curMsg.node, createVNode(createMoreCom())]),
        msgTarget
      );
      curMsg.visibleFn();
    } else {
      render(curMsg.node, msgTarget);
      curMsg.visibleFn();
    }
    if (!isRemoving) msgRemove();
    i++;
    await delay(1000);
  }
  isRunning = false;
};

/**
 * 挂载组件
 * @param node 被渲染的虚拟dom
 */
export const insert = (msg: CoverMessage) => {
  if (!msgTarget) {
    createMask();
  }

  msgList.value.push(msg);
  if (!isRunning) {
    msgShow();
  }
};
