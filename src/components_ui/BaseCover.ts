// 功能：提供open和close接口
// 基础属性 component

import { App } from "vue";

/**
 * 全屏覆盖型组件接口
 */
export default class BaseCover {
  private _component: App;
  private _mask: HTMLElement;
  /**
   * 调用组件的卸载方法并清除变量
   */
  close() {
    this._component.unmount();
    this._component = null;
    this._mask.classList.replace("visible", "invisible");
  }

  /**
   * 将传入的组件定义封装成具有生命周期的组件
   * 并挂载到body中
   * @param app 需要渲染到body中的组件
   */
  open(app: App): HTMLElement | Element | void {
    if (!this._mask) {
      // 创建全局mask
      this._mask = document.createElement("div");
      this._mask.classList.add(
        "fixed",
        "top-0",
        "left-0",
        "w-full",
        "h-full",
        "bg-[rgba(0,0,0,0.2)]",
        "invisible"
      );
      this._mask.id = "_mask";
      this._mask.addEventListener("click", this.close);
      document.body.appendChild(this._mask);
    }
    this._mask.classList.replace("invisible", "visible");

    this._component = app;
    this._component.mount(this._mask);
    const componentDom = this._mask.firstElementChild;
    // document.body.appendChild(componentDom);
    return componentDom;
  }
}
