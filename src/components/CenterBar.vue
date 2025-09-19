<template>
  <div
    class="overflow-scroll h-[60%] scrollbar-none w-1/2 absolute top-1/4 left-1/2 -translate-x-1/2 mt-5 transition-all duration-300"
    :class="
      appStore.isMore ? 'opacity-100 visible z-20' : 'opacity-0 invisible'
    "
    style="flex-shrink: 0"
  >
    <!-- grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); -->
    <Draggable
      v-if="appStore.apps.length"
      class="w-full !gap-5 grid"
      style="grid-template-columns: repeat(auto-fill, minmax(80px, 1fr))"
      v-model:list="appStore.apps"
      v-model:is-drag="isDrag"
    >
      <template #default="{ data }">
        <YGRightMenu
          @option-click="optionClick($event, data)"
          :options="[
            { label: '修改', value: 'edit' },
            { label: '删除', value: 'remove' },
          ]"
        >
          <div
            class="bg-[rgba(0,0,0,0.5)] backdrop-blur-20px w-20 h-20 inline-flex p-5 rounded-lg cursor-pointer mx-auto items-center justify-center"
            @click="
              () => {
                if (!isDrag) {
                  appStore.openApp(data);
                }
              }
            "
          >
            <img
              :draggable="false"
              :src="data.isDefault ? sysIcons[data.icon] : data.icon"
              class="w-8 h-8"
              referrerpolicy="no-referrer"
            />
          </div>
        </YGRightMenu>
      </template>
    </Draggable>
    <YGLoading v-else />
  </div>
</template>

<script setup lang="ts">
import useApp from "@/store/app";
import Draggable from "@/components_ui/Draggable.vue";
import { h, ref } from "vue";
import { sysIcons } from "@/config";
import YGRightMenu from "@/components_ui/YGRightMenu.vue";
import AddEditApp from "@/components_system/AddEditApp.vue";
import Dialog from "@/components_ui/Dialog";
import { deleteApp } from "@/api/app";
import YGLoading from "@/components_ui/YGLoading.vue";
const appStore = useApp();
const isDrag = ref(false);

const optionClick = (optionData, item) => {
  if (optionData.value === "edit") {
    const dialog = new Dialog();
    dialog.open({
      component: h(AddEditApp, {
        formData: item,
        onSuccess() {
          appStore.loadAppList();
          dialog.close();
        },
      }),
    });
  }
  if (optionData.valur === "remove") {
    deleteApp(item?.id).then(() => {
      appStore.loadAppList();
    });
  }
};
</script>
