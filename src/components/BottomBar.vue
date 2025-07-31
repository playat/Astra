<template>
  <div
    ref="bottomBarRef"
    class="backdrop-blur-20px px-4 py-3 rounded-xl mb-4 absolute left-1/2 z-10 -translate-x-1/2 bottom-0 flex gap-2 w-max"
    style="background: rgba(255, 255, 255, 0.1)"
  >
    <Draggable v-model:list="appStore.apps" v-model:is-drag="isDrag">
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
            class="w-10 h-10 p-2 bg-black-0.5 rounded-lg cursor-pointer select-none backdrop-blur-20px hover:!bg-white"
          >
            <img
              class="w-full hfull"
              :src="data.icon"
              draggable="false"
              referrerpolicy="no-referrer"
            />
          </div>
        </YGRightMenu>
      </template>
    </Draggable>
    <div
      class="w-10 h-10 p-2 bg-black-0.5 rounded-lg cursor-pointer select-none backdrop-blur-20px flex items-center justify-center shrink-1"
      @click="addApp"
    >
      <img :src="PlusSvg" draggable="false" />
    </div>
  </div>
</template>

<script setup lang="ts">
import Draggable from "@/components_ui/Draggable.vue";
import useApp from "@/store/app";
import PlusSvg from "@/assets/svg/plus.svg";
import { onMounted, ref } from "vue";
import AddApp from "./AddApp.vue";
import gsap from "gsap";
import YGRightMenu from "@/components_ui/YGRightMenu.vue";
const appStore = useApp();
const bottomBarRef = ref();
const isDrag = ref(false);
const openApp = (data: any) => {
  if (isDrag.value) return;
  appStore.openApp(data);
};

const addApp = () => {
  appStore.dialog.component = AddApp;
  appStore.dialog.visible = true;
};

const optionClick = (optionData, item) => {
  console.log(optionData, item);
  
}

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
