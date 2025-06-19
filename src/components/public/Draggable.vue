<template>
  <div
    class="flex justify-center flex-wrap relative"
    @mousemove="mouseMove"
    @mouseup="mouseUp"
  >
    <div
      ref="itemRefs"
      v-for="(item, index) in list"
      :key="item"
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
      <slot :data="curItem" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";

const props = defineProps<{
  list: any[];
}>();
const emits = defineEmits(["update:list"]);
const initIndex = ref();
const positions = ref([]);
const top = ref(0);
const left = ref(0);
const itemRefs = ref([]);
const curItem = ref();
let initX = 0;
let initY = 0;
const curIn = ref();
const curEl = ref();
let initPoint: {
  left?: number;
  top?: number;
  width?: number;
  height?: number;
} = {};

const isMove = ref();
const mouseDown = (e, item, index) => {
  curEl.value = e.currentTarget;
  curItem.value = item;
  initIndex.value = index;
  const { pageX, pageY } = e;

  initPoint = e.currentTarget.getBoundingClientRect();

  initX = pageX - initPoint.left;
  initY = pageY - initPoint.top;

  isMove.value = true;
  const { offsetLeft, offsetTop } = e.currentTarget;
  left.value = offsetLeft;
  top.value = offsetTop;

  if (positions.value.length === 0) {
    itemRefs.value.forEach((el, i) => {
      el.setAttribute("data-index", i);
      const rect = el.getBoundingClientRect();
      el.style.transform = "translate3d(0, 0, 0)";
      el.style.transition = "transform 0.3s ease";
      positions.value.push({
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      });
    });
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
  const { pageX, pageY } = e;

  const { left: containerLeft, top: containerTop } =
    e.currentTarget.getBoundingClientRect();
  left.value = pageX - containerLeft - initX;
  top.value = pageY - containerTop - initY;

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
      if (curIndex < index) {
        transPrev(curIndex, index);
      }
      if (curIndex > index) {
        transNext(curIndex, index);
      }
      transCur(index);
      curIn.value = index;
    }
  });
};

const mouseUp = () => {
  if (initIndex.value) {
    const curEl = itemRefs.value[initIndex.value];
    const curIndex = Number(curEl.getAttribute("data-index"));
    if (initIndex.value !== curIndex) {
      const newList = [...props.list];
      const movedItem = newList[initIndex.value];
      newList.splice(initIndex.value, 1);
      newList.splice(curIndex, 0, movedItem);
      emits("update:list", newList);
    }
  }

  itemRefs.value.forEach((el) => {
    el.style.transform = "";
    el.style.transition = "";
  });

  isMove.value = false;
  curItem.value = null;
  initIndex.value = null;
  positions.value = [];
  curIn.value = null;
};

const transPrev = (from, to) => {
  itemRefs.value.forEach((el) => {
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
  });
};

const transNext = (from, to) => {
  itemRefs.value.forEach((el) => {
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
  });
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
