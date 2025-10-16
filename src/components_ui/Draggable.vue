<template>
  <div
    class="flex justify-center relative gap-3"
    @mousemove="mouseMove"
    @mouseup="mouseUp"
    @touchstart="mouseMove"
    @touchend="mouseUp"
  >
    <div
      :ref="(el) => setItems(index, el)"
      v-for="(item, index) in list"
      :data-index="index"
      :key="item.key"
      @mousedown="mouseDown($event, item, index)"
      :style="{
        opacity: initIndex === index ? 0.5 : 1,
      }"
    >
      <slot :data="item" :index="index" />
    </div>

    <div
      v-if="isMove"
      :style="{
        left: `${left}px`,
        top: `${top}px`,
      }"
      class="absolute pointer-events-none bg-transparent"
    >
      <slot :data="curItem" :index="-1" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{
  list: any[];
  isDrag: boolean;
}>();
const emits = defineEmits(["update:list", "update:isDrag", "dropEnd"]);
const initIndex = ref();
const positions = ref([]);
const top = ref(0);
const left = ref(0);
const itemRefs = ref({});
const curItem = ref();
let initClientX = 0;
let initClientY = 0;
const curIn = ref();
const curEl = ref();
let initPoint: {
  left?: number;
  top?: number;
  width?: number;
  height?: number;
} = {};

const setItems = (key, el) => {
  itemRefs.value[key] = el;
};

const isMove = ref();
let isDragTimer: any;
const createPositions = () => {
  for (const key in itemRefs.value) {
    const el = itemRefs.value[key];
    el.style.transform = "translate3d(0, 0, 0)";
    el.style.transition = "transform 0.3s ease";
    positions.value.push({
      left: el.offsetLeft,
      top: el.offsetTop,
      width: el.offsetWidth,
      height: el.offsetHeight,
    });
  }
  // itemRefs.value.forEach((el, i) => {
  //   el.setAttribute("data-index", i);
  //   el.style.transform = "translate3d(0, 0, 0)";
  //   el.style.transition = "transform 0.3s ease";
  //   positions.value.push({
  //     left: el.offsetLeft,
  //     top: el.offsetTop,
  //     width: el.offsetWidth,
  //     height: el.offsetHeight,
  //   });
  // });
};
const mouseDown = (e, item, index) => {
  isDragTimer = setTimeout(() => {
    emits("update:isDrag", true);
  }, 300);
  initClientX = e.clientX;
  initClientY = e.clientY;

  curEl.value = e.currentTarget;
  curItem.value = item;

  initIndex.value = index;

  initPoint = {
    left: e.currentTarget.offsetLeft,
    top: e.currentTarget.offsetTop,
    width: e.currentTarget.offsetWidth,
    height: e.currentTarget.offsetHeight,
  };

  isMove.value = true;
  left.value = e.currentTarget.offsetLeft;
  top.value = e.currentTarget.offsetTop;

  if (positions.value.length === 0) {
    createPositions();
  }
};
// 检查当前拖拽点是否进入某个矩形范围内
const checkPointInRect = (point, rect) => {
  return (
    point.x >= rect.left &&
    point.x <= rect.left + rect.width &&
    point.y >= rect.top &&
    point.y <= rect.top + rect.height
  );
};
const mouseMove = (e) => {
  if (!isMove.value) {
    return;
  }
  left.value = initPoint.left + (e.clientX - initClientX);
  top.value = initPoint.top + (e.clientY - initClientY);

  const curEl = itemRefs.value[initIndex.value];

  const curIndex = Number(curEl.getAttribute("data-index"));

  // 检查是否进入其他卡片范围
  positions.value.forEach((rect, index) => {
    const isEnter = checkPointInRect(
      {
        x: left.value + initPoint.width / 2,
        y: top.value + initPoint.height / 2,
      },
      rect
    );
    if (isEnter && curIn.value !== index) {
      curIn.value = index;
      if (curIndex < index) {
        transPrev(curIndex, index);
      }
      if (curIndex > index) {
        transNext(curIndex, index);
      }
      transCur(index);
    }
  });
};

const mouseUp = () => {
  const curEl = itemRefs.value[initIndex.value];
  const curIndex = Number(curEl.getAttribute("data-index"));

  const clearTimer = setTimeout(() => {
    clearTimeout(isDragTimer);
    emits("update:isDrag", false);
    emits("dropEnd", { fromIndex: initIndex.value, toIndex: curIndex });
    clearTimeout(clearTimer);
  }, 300);

  // if (initIndex.value) {

  if (initIndex.value !== curIndex) {
    const newList = [...props.list];
    const movedItem = newList[initIndex.value];
    newList.splice(initIndex.value, 1);
    newList.splice(curIndex, 0, movedItem);
    emits("update:list", newList);
  }
  // }
  for (const key in itemRefs.value) {
    const el = itemRefs.value[key];
    el.setAttribute("data-index", key);
    el.style.transform = "";
    el.style.transition = "";
  }
  // itemRefs.value.forEach((el) => {
  //   el.style.transform = "";
  //   el.style.transition = "";
  // });

  isMove.value = false;
  curItem.value = null;
  initIndex.value = null;
  positions.value = [];
  // curIn.value = null;
};

const transPrev = (from, to) => {
  for (const key in itemRefs.value) {
    const el = itemRefs.value[key];
    const i = Number(el.getAttribute("data-index"));
    if (i <= to && i > from) {
      const curPos = positions.value[i];
      const prevPos = positions.value[i - 1];

      let translate3d = el.style.transform
        .match(/translate3d\(([^)]+)\)/)[1]
        .split(", ");

      let translateX = parseFloat(translate3d[0]);
      let translateY = parseFloat(translate3d[1]);

      const transX = translateX + prevPos.left - curPos.left;
      const transY = translateY + prevPos.top - curPos.top;

      el.style.transform = `translate3d(${transX}px, ${transY}px, 0)`;
      el.setAttribute("data-index", i - 1);
    }
  }
};

const transNext = (from, to) => {
  for (const key in itemRefs.value) {
    const el = itemRefs.value[key];
    const i = Number(el.getAttribute("data-index"));
    if (i >= to && i < from) {
      const curPos = positions.value[i];
      const nextPos = positions.value[i + 1];

      let translate3d = el.style.transform
        .match(/translate3d\(([^)]+)\)/)[1]
        .split(", ");

      let translateX = parseFloat(translate3d[0]);
      let translateY = parseFloat(translate3d[1]);

      const transX = translateX + nextPos.left - curPos.left;
      const transY = translateY + nextPos.top - curPos.top;

      el.style.transform = `translate3d(${transX}px, ${transY}px, 0)`;
      el.setAttribute("data-index", i + 1);
    }
  }
};

const transCur = (toIndex) => {
  const toPos = positions.value[toIndex];
  const fromPos = positions.value[initIndex.value];

  itemRefs.value[initIndex.value].style.transform = `translate3d(${
    toPos.left - fromPos.left
  }px, ${toPos.top - fromPos.top}px, 0)`;
  itemRefs.value[initIndex.value].setAttribute("data-index", toIndex);
};
</script>
