<template>
  <div
    ref="bottomBarRef"
    class="backdrop-blur-20px py-3 rounded-xl absolute top-[calc(100%-78px)] left-1/2 z-10 -translate-x-1/2 gap-2 scrollbar-none box-border"
    style="background: rgba(255, 255, 255, 0.1)"
    :style="{
      width: `${baseCount * 3.25 + 0.75}rem`,
    }"
  >
    <!-- 导入、导出按钮 -->
    <div class="absolute -right-4 -top-4 flex flex-col gap-3">
      <div
        v-if="appStore.isMore"
        class="p-2 flex items-center justify-center rounded-full cursor-pointer bg-neutral-800 box-shadow-[0_0_10px_rgba(0,0,0,0.5)]"
        @click="exportData"
      >
        <img :src="exportLoading ? LoadingSvg : ExportSvg" class="w-5 h-5" />
      </div>

      <div
        v-if="appStore.isMore"
        class="p-2 flex items-center justify-center rounded-full cursor-pointer bg-neutral-800 box-shadow-[0_0_10px_rgba(0,0,0,0.5)]"
        @click="importData"
      >
        <img :src="ImportSvg" class="w-5 h-5" />
      </div>
    </div>
    <!-- 应用名称展示 -->
    <div
      ref="appNameViewRef"
      style="background: rgba(255, 255, 255, 0.1)"
      class="absolute backdrop-blur-20px top-0 opacity-0 left-1/2 -translate-x-1/2 rounded-xl py-1 px-4 text-white pointer-events-none"
    >
      {{ hoverApp?.name }}
    </div>
    <Draggable
      v-show="appStore.apps.length && !appStore.isMore"
      v-model:list="viewAppList"
      v-model:is-drag="isDrag"
      @drop-end="dropEnd"
    >
      <template #default="{ data }">
        <AppItem
          @contextmenu.prevent="contextMenu($event, data)"
          :data="data"
          @mouseenter="boxAppFocus(data)"
          @mouseleave="boxAppBlur"
          @click="openApp(data)"
        />
      </template>
    </Draggable>
    <YGLoading v-if="!appStore.apps.length || sortLoading" />

    <!-- 抽屉 -->
    <div
      v-show="appStore.isMore"
      class="h-full overflow-y-auto overflow-x-hidden relative"
    >
     <Draggable
        v-model:list="viewAppList"
        v-model:is-drag="isDrag"
        @drop-end="dropEnd"
      >
        <template #default="{ data }">
          <AppItem
            @contextmenu.prevent="contextMenu($event, data)"
            :data="data"
            @click="openApp(data)"
            @mouseenter="boxAppFocus(data)"
            @mouseleave="boxAppBlur"
          />
        </template>
      </Draggable>
    </div>
  </div>
</template>

<script setup lang="ts">
import Draggable from "@/components_ui/Draggable.vue";
import useApp from "@/store/app";
import { computed, h, onMounted, ref, watch } from "vue";
import AddEditApp from "../components_system/AddEditApp.vue";
import gsap from "gsap";
// import YGRightMenu from "@/components_ui/YGRightMenu.vue";
import CoverDialog from "@/components_ui/CoverDialog";
import { deleteApp, exportApp, importApp, sortApp } from "@/api/app";
import YGLoading from "@/components_ui/YGLoading.vue";
import AppItem from "./AppItem.vue";
import ExportSvg from "@/assets/svg/export.svg";
import ImportSvg from "@/assets/svg/import.svg";
import LoadingSvg from "@/assets/svg/loading.svg";
import CoverRightMenu from "@/components_ui/CoverRightMenu";

const appStore = useApp();
const bottomBarRef = ref();
const isDrag = ref(false);
const appNameViewRef = ref();

const openApp = (data: any) => {
  // 增加一个微小的延迟检查，防止拖拽结束瞬间触发点击
  if (isDrag.value) return;
  appStore.openApp(data);
};

const optionClick = (optionData, item) => {
  if (optionData.value === "edit") {
    const dialog = new CoverDialog({
      component: h(AddEditApp, {
        formData: item,
        onSuccess() {
          appStore.loadAppList();
          dialog.close();
        },
      }),
    });
    dialog.open();
  }
  if (optionData.value === "remove") {
    deleteApp(item?.id).then(() => {
      appStore.loadAppList();
    });
  }
};

const sortLoading = ref(false);
const dropEnd = ({ fromIndex, toIndex }) => {
  if (!isDrag.value) return;
  sortLoading.value = true;
  sortApp({ fromIndex, toIndex })
    .then(() => {})
    .finally(() => {
      sortLoading.value = false;
    });
};
const exportLoading = ref(false);
const exportData = () => {
  if (exportLoading.value) return;
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
const importData = () => {
  // 创建隐藏的文件输入元素
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.style.display = "none";

  input.onchange = (e: any) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    importApp(formData).then(() => {
      appStore.loadAppList();
    });
  };

  input.click();
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
const baseCount = ref(0);
const viewAppList = computed({
  get: () => {
    return appStore.apps.slice(0, appCount.value);
  },
  set: (val) => {
    appStore.apps = [
      ...val,
      ...appStore.apps.slice(appCount.value, appStore.apps.length),
    ];
  },
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
  // 缓存最初的图标数量
  baseCount.value = appCount.value;
};

const contextMenu = (e, item) => {
  const rightMenu = new CoverRightMenu({
    x: e.clientX,
    y: e.clientY,
    list: [
      { label: "修改", value: "edit" },
      { label: "删除", value: "remove" },
    ],
  });
  rightMenu.onOptionClick = (option) => {
    optionClick(option, item);
  };
  rightMenu.open();
};

watch(
  () => appStore.isMore,
  (newVal) => {
    if (newVal) {
      gsap.to(bottomBarRef.value, {
        top: "30%",
        duration: 0.5,
        height: "68%",
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
