// 功能：提供open和close接口
// 基础属性 component

import { App } from "vue";

/**
 * 全屏覆盖型组件接口
 */
export default class BaseCover {
  private _component: App;
  /**
   * 调用组件的卸载方法并清除变量
   */
  close() {
    this._component.unmount();
    this._component = null;
  }

  /**
   * 将传入的组件定义封装成具有生命周期的组件
   * 并挂载到body中
   * @param app 需要渲染到body中的组件
   */
  open(app: App): HTMLElement | Element | void {
    this._component = app;
    const temp = document.createElement("div");
    this._component.mount(temp);
    const componentDom = temp.firstElementChild;
    document.body.appendChild(componentDom);
    return componentDom;
  }
}
