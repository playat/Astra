import { Component, ref, VNode } from "vue";

interface FixedOption {
  component: Component;
  onClose?: () => void;
}

export const visible = ref(false);
export const component = ref<Component>(null);
const useFixed = () => {
  const open = (option: FixedOption) => {
    component.value = option.component;
    visible.value = true;
  };
  return {
    open,
  };
};

export default useFixed;
