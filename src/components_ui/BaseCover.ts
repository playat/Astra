// 功能：提供open和close接口
// 基础属性 component

import { Fragment, h, render, VNode } from "vue";

let mask: HTMLElement = null;
let children: VNode[] = [];

/**
 * 创建通用蒙版
 */
const createMask = () => {
  // 创建全局mask
  mask = document.createElement("div");
  mask.classList.add(
    "fixed",
    "top-0",
    "left-0",
    "w-full",
    "h-full",
    "bg-[rgba(0,0,0,0.2)]",
    "invisible",
    "z-[1000]"
  );
  mask.id = "_mask";
  document.body.appendChild(mask);
};
/**
 * 挂载组件
 * @param node 被渲染的虚拟dom
 */
export const insert = (node: VNode) => {
  if (!mask) {
    createMask();
  }
  mask.classList.replace("invisible", "visible");
  children = [...children, node];
  console.log("children", children);
  render(h(Fragment, null, children), mask);
};

/**
 * 全屏覆盖型组件接口
 */
class BaseCover {
  key: string;
  /**
   * 移除特定组件
   */
  close() {
    children = children.filter((item) => item.props.key !== this.key);
    console.log("close children", children, this.key);

    render(h(Fragment, null, children), mask);
    mask.classList.replace("visible", "invisible");
  }
}

export default BaseCover;
