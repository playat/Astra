// 功能：提供open和close接口
// 基础属性 component

import {
  App,
  createVNode,
  Fragment,
  FunctionalComponent,
  h,
  render,
  VNode,
} from "vue";

/**
 * 全屏覆盖型组件接口
 */
export default class BaseCover {
  #children: VNode[] = [];
  #mask: HTMLElement;
  /**
   * 移除特定组件
   */
  close(key: string) {
    const index = this.#children.findIndex((item) => item.props.key === key);
    if (index !== -1) {
      this.#children.splice(index, 1);
      render(h(Fragment, this.#children), this.#mask);
    }
    this.#mask.classList.replace("visible", "invisible");
  }
  /**
   * 创建通用蒙版组件
   */
  createMask() {
    // 创建全局mask
    this.#mask = document.createElement("div");
    this.#mask.classList.add(
      "fixed",
      "top-0",
      "left-0",
      "w-full",
      "h-full",
      "bg-[rgba(0,0,0,0.2)]",
      "invisible",
      "z-[1000]"
    );
    this.#mask.id = "_mask";
    document.body.appendChild(this.#mask);
  }

  /**
   * 挂载组件
   * @param node 被渲染的虚拟dom
   */
  insert(node: VNode) {
    if (!this.#mask) {
      this.createMask();
    }

    this.#mask.classList.replace("invisible", "visible");

    this.#children.push(node);
    render(h(Fragment, this.#children), this.#mask);
  }
}
