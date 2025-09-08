import YGDialog from "@/components_ui/YGDialog.vue";
import { App, Component, createApp, h } from "vue";

interface DialogOption {
  component: Component;
  onClose?: () => void;
  onConfirm?: () => void;
}

class Dailog {
  private dialogComponent: App = null;
  close = () => {
    this.dialogComponent.unmount();
    this.dialogComponent = null;
  };

  open = (option: DialogOption) => {
    const defaultProps = {
      onClose: this.close,
    };
    // 2. 创建独立的Vue应用实例
    this.dialogComponent = createApp({
      render() {
        // 用h函数渲染目标组件，并传递props
        return h(YGDialog, defaultProps, {
          default: () => h(option.component),
        });
      },
    });

    // 1. 创建临时容器（仅用于初始挂载，之后会被移除）
    const tempContainer = document.createElement("div");
    this.dialogComponent.mount(tempContainer);
    document.body.appendChild(tempContainer.firstElementChild);
  };
}

const useDialog = () => {
  return new Dailog();
};

export default useDialog;
