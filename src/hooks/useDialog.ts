import { Component, ref, VNode } from "vue"

const visible = ref(false)

const content = ref<Component>(null)

export const open = (options: {
  content: Component
}) => {
  visible.value = true
  content.value = options.content
}


const dialog = {
  open,
  visible,
  content
}

export default dialog