import { h } from "vue";
import CoverDailog from "./CoverDialog.js";
import MessageBox from "@/components_system/MessageBox.vue";

interface MessageBoxOptions {
  title?: string;
  message?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

class CoverMessageBox extends CoverDailog {
  constructor(options: MessageBoxOptions) {
    super({
      component: h(MessageBox, {
        title: options.title,
        message: options.message,
        onConfirm: () => {
          options.onConfirm?.();
          this.hiddenFn();
        },
        onCancel: () => {
          options.onCancel?.();
          this.hiddenFn();
        },
      }),
    });
    this.key = `msgbox_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  }

  open() {
    super.open();
  }
}

export default CoverMessageBox;
