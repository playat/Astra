import YGDialog from "@/components_ui/YGDialog.vue";
import { Component, h } from "vue";
import BaseCover from "./BaseCover.js";

interface DialogOption {
  component: Component;
}

class Dailog extends BaseCover {
  open = (option: DialogOption) => {
    const defaultProps = {
      onClose: this.close,
    };
    const com = h(YGDialog, defaultProps, {
      default: () => h(option.component),
    });

    super.open(com);
  };
}

const useDialog = () => {
  return new Dailog();
};

export default useDialog;
