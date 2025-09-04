<template>
  <div
    ref="bottomBarRef"
    class="backdrop-blur-20px px-4 py-3 rounded-xl mb-4 absolute left-1/2 z-10 -translate-x-1/2 bottom-0 gap-2 scrollbar-none"
    style="background: rgba(255, 255, 255, 0.1)"
  >
    <Draggable
      v-if="appStore.apps.length"
      v-model:list="viewAppList"
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
import { computed, h, onMounted, ref } from "vue";
import AddEditApp from "./AddEditApp.vue";
import gsap from "gsap";
import YGRightMenu from "@/components_ui/YGRightMenu.vue";
import { sysIcons } from "@/config";
import useDialog from "@/hooks/useDialog";

const dialog = useDialog();
const appStore = useApp();
const bottomBarRef = ref();
const isDrag = ref(false);
const openApp = (data: any) => {
  if (isDrag.value) return;
  appStore.openApp(data);
};

const optionClick = (optionData, item) => {
  if (optionData.value === "edit") {
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
const appCount = ref(0);

const viewAppList = computed(() => {
  return appStore.apps.slice(0, appCount.value);
});

const initCount = () => {
  // 获取根元素的字体大小
  const fontSize = parseFloat(
    getComputedStyle(document.documentElement).fontSize
  );
  // 读取视口宽度后
  // 计算视口宽度可以放下多少个图标
  // 图标宽: 2.5rem
  // 间距: 0.75rem
  // 外部padding: 2rem
  // 视口宽度 window.innerWidth
  // 2.5n + 0.75n - 0.75 ≤ W - 2
  appCount.value = Math.round(
    ((window.innerWidth / fontSize) * 0.9 - 1.25) / 3.25
  );
};

onMounted(() => {
  initCount();

  // 监听视口宽度变化
  window.addEventListener("resize", () => {
    initCount();
  });
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
