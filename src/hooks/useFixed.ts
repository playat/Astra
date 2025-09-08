import { Component, h } from "vue";
import BaseCover from "./BaseCover.js";
import YGFixed from "@/components_ui/YGFixed.vue";

interface FixedOption {
  component: Component;
}

class Fixed extends BaseCover {
  open = (option: FixedOption) => {
    const defaultProps = {
      onClose: this.close,
    };
    const com = h(YGFixed, defaultProps, {
      default: () => h(option.component),
    });

    super.open(com);
  };
}

const useFixed = () => {
  return new Fixed();
};

export default useFixed;
