import { createVNode, defineComponent, h, onMounted, ref } from "vue";
import CoverDailog from "./CoverDialog.js";
import MessageBox from "@/components_system/MessageBox.vue";

interface MessageBoxOptions {
  title?: string;
  message?: string; // 显示的消息内容
}

class CoverMessageBox extends CoverDailog {
  constructor(options: MessageBoxOptions) {
    super({
      component: h(MessageBox, {
        title: options.title,
        message: options.message,
        onConfirm: () => this.hiddenFn(),
        onCancel: () => this.hiddenFn(),
      }),
    });
    this.key = `msgbox_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  open() {
    super.open()
  }
}

export default CoverMessageBox;
