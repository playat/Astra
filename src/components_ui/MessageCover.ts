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

const closeAllMsg = () => {};

const delay = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

let isRunning = false;
const msgShow = async () => {
  isRunning = true;
  const currentTasks = [...msgList.value]; // 拷贝当前列表，避免执行中列表变更影响
  console.log("currentTasks length", currentTasks.length);

  // 从右到左执行（列表尾部 → 头部）
  for (let i = currentTasks.length - 1; i >= 0; i--) {
    console.log("------", i);

    // const currentTask = currentTasks[i];
    // const prevTask = currentTasks[i + 1]; // 前一个任务（更靠右的任务）
    // // console.log("任务列表", msgList.value);
    // // console.log("currentTask", currentTask);
    // // console.log("prevTask", prevTask);

    // if (prevTask) {
    //   // 非第一个任务：先调用前一个任务的 hiddenFn
    //   await prevTask.hiddenFn();
    //   render(
    //     h(Fragment, null, [prevTask.node, createVNode(createMoreCom())]),
    //     msgTarget
    //   );
    //   currentTask.visibleFn();
    //   // 间隔1秒
    //   await delay(1000);
    // } else {
    //   // 调用当前任务的 visibleFn
    //   render(currentTask.node, msgTarget);
    //   currentTask.visibleFn();
    // }

    // 除了最后一个任务（最左侧），执行后间隔1秒
    // if (i > 0) {
    await delay(1000);
    // }
  }

  isRunning = false;
  // 若执行过程中新增了任务（当前列表长度 > 拷贝时长度），继续执行新任务
  if (msgList.value.length > currentTasks.length) {
    msgShow();
  }
};

/**
 * 挂载组件
 * @param node 被渲染的虚拟dom
 */
export const insert = (msg: CoverMessage) => {
  if (!msgTarget) {
    createMask();
  }

  msgList.value.unshift(msg);
  if (!isRunning) {
    msgShow();
  }
  // if (msgList.value[0]) {
  //   console.log("1");

  //   msgList.value[0].hiddenFn().then(() => {
  //     msgList.value.unshift(msg);
  //     render(
  //       h(Fragment, null, [
  //         msgList.value[0].node,
  //         createVNode(createMoreCom()),
  //       ]),
  //       msgTarget
  //     );
  //     msg.visibleFn();
  //   });
  // } else {
  //   console.log("2");

  //   msgList.value.unshift(msg);
  //   render(msg.node, msgTarget);
  //   msg.visibleFn();
  // }
};
