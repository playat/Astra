export const hasFocusDom = () => {
  const activeEl = document.activeElement as HTMLElement;

  if (!activeEl) return false; // 无焦点元素

  // 检查标签名：input/textarea/select
  const tagName = activeEl.tagName.toLowerCase();
  if (["input", "textarea", "select"].includes(tagName)) {
    // 排除 input[type="hidden"]（隐藏元素不会获得焦点，但保险起见）
    return (
      tagName !== "input" || (activeEl as HTMLInputElement).type !== "hidden"
    );
  }

  // 检查可编辑元素（contenteditable="true"）
  if (activeEl.isContentEditable) {
    return true;
  }

  return false;
};
