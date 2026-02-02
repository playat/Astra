<template>
  <div class="flex justify-center relative gap-3 flex-wrap">
    <!-- Draggable Items -->
    <div
      v-for="(item, index) in list"
      :key="item.key || index"
      :ref="(el) => (itemRefs[index] = el as HTMLElement)"
      :data-index="index"
      class="transition-transform duration-300 ease-out will-change-transform select-none"
      :class="{ 'opacity-50': dragIndex === index }"
      @mousedown="onMouseDown($event, item, index)"
      @touchstart.passive="onMouseDown($event, item, index)"
    >
      <slot :data="item" :index="index" />
    </div>

    <!-- Dragging Phantom Element -->
    <Teleport to="body">
      <div
        v-if="isDragging && dragItem"
        class="fixed pointer-events-none z-[9999] opacity-90"
        :style="{
          left: `${dragPos.x}px`,
          top: `${dragPos.y}px`,
          width: `${dragRect.width}px`,
          height: `${dragRect.height}px`,
          margin: 0, // Ensure no external margin affects positioning
        }"
      >
        <slot :data="dragItem" :index="-1" />
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onBeforeUnmount } from "vue";

interface Props {
  list: any[];
  isDrag?: boolean;
}

const props = defineProps<Props>();

const emits = defineEmits<{
  (e: "update:list", value: any[]): void;
  (e: "update:isDrag", value: boolean): void;
  (e: "dropEnd", value: { fromIndex: number; toIndex: number }): void;
}>();

// State
const itemRefs = ref<HTMLElement[]>([]);
const dragItem = ref<any>(null);
const dragIndex = ref<number>(-1); // The original index of the item being dragged
const hoverIndex = ref<number>(-1); // The current visual index target
const isDragging = ref(false);
const isPressed = ref(false); // Mouse/Touch is down but drag might not have started
const dragPos = ref({ x: 0, y: 0 });
const dragRect = ref({ width: 0, height: 0 });

// Layout Cache
interface Rect {
  left: number;
  top: number;
  width: number;
  height: number;
}
let itemRects: Rect[] = [];
let startPointer = { x: 0, y: 0 };
let initialItemPos = { x: 0, y: 0 };
let pendingItem: { item: any; index: number; target: HTMLElement } | null = null;

// Event Helpers
const getPointerPos = (e: MouseEvent | TouchEvent) => {
  if (e instanceof MouseEvent) {
    return { x: e.clientX, y: e.clientY };
  }
  const touch = e.touches[0] || e.changedTouches[0];
  return { x: touch.clientX, y: touch.clientY };
};

// 1. Mouse/Touch Down
const onMouseDown = (e: MouseEvent | TouchEvent, item: any, index: number) => {
  if (e instanceof MouseEvent && e.button !== 0) return; // Only left click

  const target = e.currentTarget as HTMLElement;
  const { x, y } = getPointerPos(e);
  startPointer = { x, y };
  
  pendingItem = { item, index, target };
  isPressed.value = true;
  
  // Add global listeners
  window.addEventListener("mousemove", onMove, { passive: false });
  window.addEventListener("touchmove", onMove, { passive: false });
  window.addEventListener("mouseup", onUp);
  window.addEventListener("touchend", onUp);
};

// 2. Start Drag (Called when movement threshold passed)
const startDrag = () => {
  if (!pendingItem) return;
  
  const { item, index, target } = pendingItem;
  
  captureLayout();
  
  const rect = target.getBoundingClientRect();
  initialItemPos = { x: rect.left, y: rect.top };
  dragRect.value = { width: rect.width, height: rect.height };
  dragPos.value = { x: rect.left, y: rect.top };
  
  isDragging.value = true;
  dragItem.value = item;
  dragIndex.value = index;
  hoverIndex.value = index;
  
  emits("update:isDrag", true);
};

// 3. Move
const onMove = (e: MouseEvent | TouchEvent) => {
  if (!isPressed.value) return;

  const { x, y } = getPointerPos(e);
  
  // If not yet dragging, check threshold
  if (!isDragging.value) {
    const dx = x - startPointer.x;
    const dy = y - startPointer.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    if (distance > 5) { // 5px threshold
      startDrag();
    } else {
      return; // Haven't moved enough
    }
  }
  
  // Dragging logic
  if (e.cancelable) e.preventDefault(); // Prevent scroll
  
  const dx = x - startPointer.x;
  const dy = y - startPointer.y;
  
  dragPos.value = {
    x: initialItemPos.x + dx,
    y: initialItemPos.y + dy,
  };
  
  // Collision detection
  const centerX = dragPos.value.x + dragRect.value.width / 2;
  const centerY = dragPos.value.y + dragRect.value.height / 2;
  
  let newHoverIndex = -1;
  
  for (let i = 0; i < itemRects.length; i++) {
    const r = itemRects[i];
    if (
      centerX >= r.left &&
      centerX <= r.left + r.width &&
      centerY >= r.top &&
      centerY <= r.top + r.height
    ) {
      newHoverIndex = i;
      break;
    }
  }
  
  if (newHoverIndex !== -1 && newHoverIndex !== hoverIndex.value) {
    hoverIndex.value = newHoverIndex;
    updateLayout();
  }
};

// 4. Update Layout Transforms
const updateLayout = () => {
  const from = dragIndex.value;
  const to = hoverIndex.value;
  
  itemRefs.value.forEach((el, index) => {
    if (!el) return;
    
    // The dragged item stays hidden/dimmed in its original slot
    if (index === from) {
      const targetRect = itemRects[to];
      const currentRect = itemRects[from];
      const tx = targetRect.left - currentRect.left;
      const ty = targetRect.top - currentRect.top;
      el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      return;
    }
    
    let shift = 0;
    // Calculate shift direction
    if (from < to) {
      if (index > from && index <= to) shift = -1;
    } else if (from > to) {
      if (index >= to && index < from) shift = 1;
    }
    
    if (shift !== 0) {
      // Logic: If I need to shift, I move to the position of the neighbor I'm displacing.
      // If I'm shifting -1 (left), I move to index-1's rect.
      // But my natural position is index's rect.
      // So translate = rect[index-1] - rect[index]
      
      const targetIndex = index + shift;
      const targetRect = itemRects[targetIndex];
      const currentRect = itemRects[index];
      
      const tx = targetRect.left - currentRect.left;
      const ty = targetRect.top - currentRect.top;
      el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
    } else {
      el.style.transform = ``;
    }
  });
};

// 5. Mouse/Touch Up
const onUp = () => {
  isPressed.value = false;
  pendingItem = null;
  
  window.removeEventListener("mousemove", onMove);
  window.removeEventListener("touchmove", onMove);
  window.removeEventListener("mouseup", onUp);
  window.removeEventListener("touchend", onUp);
  
  if (isDragging.value) {
    // Commit changes
    if (dragIndex.value !== hoverIndex.value && hoverIndex.value !== -1) {
      const newList = [...props.list];
      const [moved] = newList.splice(dragIndex.value, 1);
      newList.splice(hoverIndex.value, 0, moved);
      emits("update:list", newList);
      emits("dropEnd", { fromIndex: dragIndex.value, toIndex: hoverIndex.value });
    }

    // Delay resetting isDragging slightly to block the click event
    setTimeout(() => {
      isDragging.value = false;
      emits("update:isDrag", false);
    }, 0);
    
    // Cleanup
    dragItem.value = null;
    dragIndex.value = -1;
    hoverIndex.value = -1;
    itemRects = [];
    
    // Reset transforms
    itemRefs.value.forEach(el => {
      if(el) el.style.transform = '';
    });
  }
};

const captureLayout = () => {
  itemRects = [];
  itemRefs.value = itemRefs.value.filter(Boolean);
  itemRefs.value.forEach((el) => {
    const rect = el.getBoundingClientRect();
    itemRects.push({
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
    });
  });
};

onBeforeUnmount(() => {
  window.removeEventListener("mousemove", onMove);
  window.removeEventListener("touchmove", onMove);
  window.removeEventListener("mouseup", onUp);
  window.removeEventListener("touchend", onUp);
});
</script>
