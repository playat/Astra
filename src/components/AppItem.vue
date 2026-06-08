<template>
  <div
    ref="appRef"
    class="w-10 h-10 p-2 bg-black/50 rounded-lg cursor-pointer relative select-none backdrop-blur-[20px] hover:bg-white!"
    @contextmenu.prevent="onContextMenu"
  >
    <YGImage
      :src="data.isDefault ? sysIcons[data.icon] : data.icon"
      draggable="false"
      referrerpolicy="no-referrer"
    >
      <template #error>
        <div
          class="flex items-center justify-center text-white rounded-md w-full h-full"
          :style="{
            backgroundColor: getInvertColor(getRandomLightColor()),
          }"
        >
          {{ data.name.charAt(0) }}
        </div>
      </template>
    </YGImage>
    <div
      v-if="data.is_default_open"
      class="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-green-400 shadow-[0_0_4px_rgba(74,222,128,0.6)]"
    ></div>
  </div>
</template>

<script setup lang="ts">
import YGImage from "@/components_ui/YGImage.vue";
import { sysIcons } from "@/config";
import { getInvertColor, getRandomLightColor } from "@/utils/color";
import CoverRightMenu from "@/components_ui/CoverRightMenu";
import CoverDialog from "@/components_ui/CoverDialog";
import CoverMessageBox from "@/components_ui/CoverMessageBox";
import { deleteApp, setDefaultOpen } from "@/api/app";
import useApp from "@/store/app";
import { h } from "vue";
import AddEditApp from "@/components_system/AddEditApp.vue";

const props = defineProps<{
  data: any;
}>();

const emit = defineEmits<{
  (e: "refresh"): void;
}>();

const appStore = useApp();

const onContextMenu = (e: MouseEvent) => {
  const rightMenu = new CoverRightMenu({
    x: e.clientX,
    y: e.clientY,
    list: [
      { label: "修改", value: "edit" },
      { label: props.data.is_default_open ? "取消默认打开" : "设为默认打开", value: "defaultOpen" },
      { label: "删除", value: "remove" },
    ],
  });
  rightMenu.onOptionClick = (option) => {
    handleOption(option);
  };
  rightMenu.open();
};

const handleOption = (option: { label: string; value?: string }) => {
  if (option.value === "edit") {
    const dialog = new CoverDialog({
      component: h(AddEditApp, {
        formData: props.data,
        onSuccess() {
          appStore.loadAppList();
          dialog.close();
        },
      }),
    });
    dialog.open();
  }
  if (option.value === "remove") {
    deleteApp(props.data.id).then(() => {
      appStore.loadAppList();
    });
  }
  if (option.value === "defaultOpen") {
    handleDefaultOpen();
  }
};

const handleDefaultOpen = () => {
  const isCurrentlyDefault = props.data.is_default_open;
  const actionText = isCurrentlyDefault ? "取消默认打开" : "设为默认打开";

  new CoverMessageBox({
    title: "确认操作",
    message: `确定要${actionText}「${props.data.name}」吗？`,
    onConfirm: () => {
      setDefaultOpen(props.data.id, isCurrentlyDefault ? 0 : 1).then(() => {
        appStore.loadAppList();
      });
    },
  }).open();
};
</script>
