import { Component, ref, VNode } from "vue";

export const component = ref<Component>(null);
export const visible = ref(false);

interface FixedOption {
  component: VNode;
  onClose?: () => void;
}

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
