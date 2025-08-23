<template>
  <div
    ref="bottomBarRef"
    class="backdrop-blur-20px max-w-4/5 px-4 py-3 rounded-xl mb-4 absolute left-1/2 z-10 -translate-x-1/2 bottom-0 gap-2 scrollbar-none"
    style="background: rgba(255, 255, 255, 0.1)"
  >
    <Draggable
      v-if="appStore.apps.length"
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
            @click="openApp(data)"
            class="w-10 h-10 p-2 bg-black-0.5 rounded-lg cursor-pointer relative select-none backdrop-blur-20px hover:!bg-white"
            @mouseenter="appFocus($event)"
            @mouseleave="appBlur($event)"
          >
            <div
              class="app-name pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 text-nowrap text-sm text-white py-2 opacity-0 px-4 rounded-md bg-[var(--yg-bg-color)]"
            >
              {{ data.name }}
            </div>
            <img
              class="w-full h-full"
              :src="data.isDefault ? sysIcons[data.icon] : data.icon"
              draggable="false"
              referrerpolicy="no-referrer"
            />
          </div>
        </YGRightMenu>
      </template>
    </Draggable>
    <!-- <div
      class="w-10 h-10 p-2 bg-black-0.5 rounded-lg cursor-pointer select-none backdrop-blur-20px flex items-center justify-center shrink-1"
      @click="addApp"
    >
      <img :src="PlusSvg" draggable="false" />
    </div> -->
  </div>
</template>

<script setup lang="ts">
import Draggable from "@/components_ui/Draggable.vue";
import useApp from "@/store/app";
import { h, onMounted, ref } from "vue";
import AddEditApp from "./AddEditApp.vue";
import gsap from "gsap";
import YGRightMenu from "@/components_ui/YGRightMenu.vue";
import { sysIcons } from "@/config";

const appStore = useApp();
const bottomBarRef = ref();
const isDrag = ref(false);
const openApp = (data: any) => {
  if (isDrag.value) return;
  appStore.openApp(data);
};

const optionClick = (optionData, item) => {
  if (optionData.value === "edit") {
    appStore.dialog.component = h(AddEditApp, { formData: item });
    appStore.dialog.visible = true;
  }
  if (optionData.valur === "remove") {
  }
};

const appFocus = (e) => {
  // 获取当前悬浮的应用数据
  const currentApp = e.target.children[0];
  gsap.to(currentApp, {
    opacity: 1,
    top: "-52px",
    duration: 0.2,
    ease: "power2.out",
  });
};

const appBlur = (e) => {
  const currentApp = e.target.children[0];
  // 获取对应的 DOM 元素
  // 隐藏应用名称提示
  gsap.to(currentApp, {
    opacity: 0,
    top: 0,
    duration: 0.5,
    ease: "power2.out",
  });
};

onMounted(() => {
  gsap.fromTo(
    bottomBarRef.value,
    {
      y: `100%`,
      opacity: 0,
    },
    { y: 0, opacity: 1, duration: 1, ease: "elastic.out(1, 0.9)" }
  );
});
</script>
