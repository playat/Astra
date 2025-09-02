import { Component, ref, VNode } from "vue";

interface DialogOption {
  component: Component;
  onClose?: () => void;
  onConfirm?: () => void;
}
export const visible = ref(false);
export const component = ref<Component>(null);

const useDialog = () => {
  const open = (option: DialogOption) => {
    component.value = option.component;
    visible.value = true;
  };

  return {
    open,
  };
};

export default useDialog;
