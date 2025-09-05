import YGDialog from "@/components_ui/YGDialog.vue";
import { Component, h, ref, render, VNode } from "vue";

interface DialogOption {
  component: VNode;
  onClose?: () => void;
  onConfirm?: () => void;
}

class Dailog {
  private component = ref<VNode>(null);
  private visible = ref(false);
  private dialogComponent = null;
  close = () => {
    this.component.value = null;
    this.visible.value = false;
    // 从DOM中移除对话框组件
    render(null, document.body);
    this.dialogComponent = null;
  };

  open = (option: DialogOption) => {
    this.component.value = option.component;
    this.visible.value = true;
    this.dialogComponent = h(
      YGDialog,
      {
        visible: this.visible.value,
        onClose: this.close,
      },
      this.component.value
    );
    render(this.dialogComponent, document.body);
  };
}

const useDialog = () => {
  return new Dailog();
};

export default useDialog;
