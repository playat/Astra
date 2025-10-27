// 功能：提供open和close接口
// 基础属性 component

import {
  App,
  createVNode,
  DefineSetupFnComponent,
  Fragment,
  FunctionalComponent,
  h,
  render,
  VNode,
} from "vue";

/**
 * 全屏覆盖型组件接口
 */
abstract class BaseCover {
  #children: VNode[] = [];
  #mask: HTMLElement;
  abstract key: string;
  abstract open(options: any): void;

  /**
   * 移除特定组件
   */
  close() {
    this.#children = this.#children.filter(
      (item) => item.props.key !== this.key
    );
    render(h(Fragment, this.#children), this.#mask);
    this.#mask.classList.replace("visible", "invisible");
  }

  /**
   * 创建通用蒙版
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
    this.#mask.onclick = this.close.bind(this);
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

export default BaseCover;
