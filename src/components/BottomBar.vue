<template>
  <div
    ref="bottomBarRef"
    class="backdrop-blur-20px px-4 py-3 rounded-xl absolute top-[calc(100%-78px)] left-1/2 z-10 -translate-x-1/2 gap-2 scrollbar-none box-border"
    style="background: rgba(255, 255, 255, 0.1)"
  >
    <!-- 应用名称展示 -->
    <div
      ref="appNameViewRef"
      style="background: rgba(255, 255, 255, 0.1)"
      class="absolute backdrop-blur-20px top-0 opacity-0 left-1/2 -translate-x-1/2 rounded-xl py-1 px-4 text-white pointer-events-none"
    >
      {{ hoverApp?.name }}
    </div>
    <Draggable
      v-if="appStore.apps.length && !appStore.isMore"
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
          <AppItem
            :data="data"
            @mouseenter="boxAppFocus(data)"
            @mouseleave="boxAppBlur"
            @click="openApp(data)"
          />
        </YGRightMenu>
      </template>
    </Draggable>
    <YGLoading v-if="!appStore.apps.length" />

    <!-- 抽屉 -->
    <div
      v-if="appStore.isMore"
      class="grid w-full gap-4 h-full overflow-y-auto overflow-x-hidden relative"
      style="
        grid-template-columns: repeat(auto-fill, 40px);
        grid-auto-rows: 40px;
      "
      :style="{
        width: appStore.isMore
          ? `${appCountTemp * 2.5 + (appCountTemp - 1)}rem`
          : 'auto',
      }"
    >
      <!-- 导出按钮 -->
      <div
        class="absolute -right-4 -top-4 rounded-full bg-black"
        @click="exportData"
      ></div>
      <YGRightMenu
        v-for="data in viewAppList"
        :key="data.key"
        @option-click="optionClick($event, data)"
        :options="[
          { label: '修改', value: 'edit' },
          { label: '删除', value: 'remove' },
        ]"
      >
        <AppItem
          :data="data"
          @click="openApp(data)"
          @mouseenter="boxAppFocus(data)"
          @mouseleave="boxAppBlur"
        />
      </YGRightMenu>
    </div>
  </div>
</template>

<script setup lang="ts">
import Draggable from "@/components_ui/Draggable.vue";
import useApp from "@/store/app";
import { computed, h, onMounted, ref, watch } from "vue";
import AddEditApp from "../components_system/AddEditApp.vue";
import gsap from "gsap";
import YGRightMenu from "@/components_ui/YGRightMenu.vue";
import Dialog from "@/components_ui/Dialog";
import { deleteApp, exportApp } from "@/api/app";
import YGLoading from "@/components_ui/YGLoading.vue";
import AppItem from "./AppItem.vue";

const appStore = useApp();
const bottomBarRef = ref();
const isDrag = ref(false);
const appNameViewRef = ref();

const openApp = (data: any) => {
  if (isDrag.value) return;
  appStore.openApp(data);
};

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

// const appFocus = (e) => {
//   // 获取当前悬浮的应用数据
//   const currentApp = e.target.children[0];
//   gsap.to(currentApp, {
//     opacity: 1,
//     duration: 0.2,
//     ease: "power2.out",
//   });
// };

// const appBlur = (e) => {
//   const currentApp = e.target.children[0];
//   // 获取对应的 DOM 元素
//   // 隐藏应用名称提示
//   gsap.to(currentApp, {
//     opacity: 0,
//     duration: 0.2,
//     ease: "power2.out",
//   });
// };
const exportLoading = ref(false);
const exportData = () => {
  exportLoading.value = true;
  exportApp()
    .then((res: { filename: string; blob: Blob }) => {
      // 下载文件
      const url = window.URL.createObjectURL(new Blob([res.blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", res.filename);
      link.click();
      window.URL.revokeObjectURL(url);
    })
    .finally(() => {
      exportLoading.value = false;
    });
};
const hoverApp = ref(null);

const boxAppFocus = (data) => {
  hoverApp.value = data;
  // const currentApp = data.children[0];
  gsap.to(appNameViewRef.value, {
    opacity: 1,
    top: "-52px",
    duration: 0.2,
    ease: "power2.out",
  });
};

const boxAppBlur = () => {
  hoverApp.value = null;
  // const currentApp = data.children[0];
  // 获取对应的 DOM 元素
  // 隐藏应用名称提示
  gsap.to(appNameViewRef.value, {
    opacity: 0,
    top: 0,
    duration: 0.2,
    ease: "power2.out",
  });
};

const appCount = ref(0);
const appCountTemp = ref(0);
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
  appCountTemp.value = appCount.value = Math.round(
    ((window.innerWidth / fontSize) * 0.9 - 1.25) / 3.25
  );
};

watch(
  () => appStore.isMore,
  (newVal) => {
    if (newVal) {
      gsap.to(bottomBarRef.value, {
        top: "30%",
        duration: 0.5,
        height: "70%",
        ease: "elastic.out(0.7, 0.9)",
      });
      appCount.value = appStore.apps.length;
    } else {
      gsap.to(bottomBarRef.value, {
        height: "auto",
        top: "calc(100% - 78px)",
        duration: 0.5,
        ease: "elastic.out(0.7, 0.9)",
      });
      initCount();
    }
  }
);

watch(
  () => appStore.apps,
  (newVal) => {
    if (newVal.length) {
      gsap.fromTo(
        bottomBarRef.value,
        {
          y: `100%`,
          opacity: 0,
        },
        {
          y: 0,
          delay: 0.2,
          opacity: 1,
          duration: 1,
          ease: "elastic.out(1, 0.9)",
        }
      );
    }
  }
);

onMounted(() => {
  initCount();

  // 监听视口宽度变化
  window.addEventListener("resize", () => {
    initCount();
  });
});
</script>
