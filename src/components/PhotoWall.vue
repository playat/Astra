<template>
  <!-- Photos layer: shown when visible -->
  <div
    v-if="photoWallStore.visible"
    class="fixed inset-0 z-10 pointer-events-none"
  >
    <!-- Toolbar -->
    <Transition name="toolbar">
      <div
        v-show="showToolbar"
        class="fixed top-0 left-0 right-0 mx-auto w-fit z-999 pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-b-2xl bg-black/60 backdrop-blur-xl border border-white/10 border-t-0 shadow-2xl"
        @mouseleave="onToolbarLeave"
        @mouseenter="onToolbarEnter"
      >
        <button
          class="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
          @click="triggerFileInput"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          添加照片
        </button>
        <button
          class="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
          @click="photoWallStore.resetLayout()"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="1 4 1 10 7 10" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
          重置布局
        </button>
        <button
          class="flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm transition-colors"
          :class="photoWallStore.editing
            ? 'bg-red-500/20 hover:bg-red-500/40 text-red-300'
            : 'bg-green-500/20 hover:bg-green-500/40 text-green-300'"
          @click="photoWallStore.toggleEditing()"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
          {{ photoWallStore.editing ? '关闭编辑' : '开启编辑' }}
        </button>
        <input
          ref="fileInputRef"
          type="file"
          accept="image/*"
          multiple
          class="hidden"
          @change="onFileChange"
        />
      </div>
    </Transition>

    <!-- Photos -->
    <div
      v-for="(photo, index) in photoWallStore.photos"
      :key="photo.id"
      class="absolute select-none pointer-events-auto photo-anim"
      :class="photoWallStore.editing && 'cursor-grab active:cursor-grabbing'"
      :style="{
        left: 0,
        top: 0,
        transform: `translate(${photo.x}px, ${photo.y}px) rotate(${photo.rotation}deg) scale(${photo.scale})`,
        zIndex: photo.zIndex,
        transformOrigin: 'center center',
        animationDelay: `${PHOTO_BASE_DELAY + index * PHOTO_STAGGER}s`,
      }"
      @mousedown.left="photoWallStore.editing && onDragStart($event, photo)"
      @touchstart.passive="photoWallStore.editing && onTouchStart($event, photo)"
      @wheel.prevent="photoWallStore.editing && onWheel($event, photo)"
      @mousedown.right="onPhotoRightClick($event, photo)"
      @dblclick="onDoubleClick(photo)"
      @click.left.stop="photoWallStore.bringToFront(photo.id)"
    >
        <img
          :src="photo.url"
          class="pointer-events-none rounded-lg shadow-2xl border-2 border-white/10 max-w-[300px] max-h-[300px] object-contain"
          draggable="false"
        />
        <!-- Rotate handle: only in editing mode -->
        <div
          v-if="photoWallStore.editing"
          class="absolute -top-3 -right-3 w-6 h-6 bg-white/80 rounded-full flex items-center justify-center cursor-grab shadow-md hover:bg-white transition-colors"
          @mousedown.left.stop="onRotateHandleStart($event, photo)"
        >
          <svg class="w-3 h-3 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
            <path d="M1 4v6h6" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import usePhotoWall, { type PhotoItem } from "@/store/photoWall";

const photoWallStore = usePhotoWall();
const fileInputRef = ref<HTMLInputElement>();
const showToolbar = ref(false);
let toolbarHideTimer: ReturnType<typeof setTimeout> | null = null;

const onMouseMove = (e: MouseEvent) => {
  if (!photoWallStore.visible) return;
  if (e.clientY < 60) {
    if (toolbarHideTimer) { clearTimeout(toolbarHideTimer); toolbarHideTimer = null; }
    showToolbar.value = true;
  } else if (showToolbar.value && !toolbarHideTimer) {
    toolbarHideTimer = setTimeout(() => { showToolbar.value = false; toolbarHideTimer = null; }, 300);
  }
};

const onToolbarLeave = () => {
  toolbarHideTimer = setTimeout(() => { showToolbar.value = false; toolbarHideTimer = null; }, 300);
};

const onToolbarEnter = () => {
  if (toolbarHideTimer) { clearTimeout(toolbarHideTimer); toolbarHideTimer = null; }
};

const PHOTO_BASE_DELAY = 1.2;
const PHOTO_STAGGER = 0.15;

const triggerFileInput = () => {
  fileInputRef.value?.click();
};

const onFileChange = (e: Event) => {
  const input = e.target as HTMLInputElement;
  if (!input.files) return;
  for (const file of input.files) {
    photoWallStore.addPhoto(file);
  }
  input.value = "";
};

// --- Drag ---
let dragPhoto: PhotoItem | null = null;
let dragOffsetX = 0;
let dragOffsetY = 0;

const onDragStart = (e: MouseEvent, photo: PhotoItem) => {
  dragPhoto = photo;
  // 偏移 = 鼠标 - 原点(x,y)，和 scale 无关
  dragOffsetX = e.clientX - photo.x;
  dragOffsetY = e.clientY - photo.y;
  window.addEventListener("mousemove", onDragMove);
  window.addEventListener("mouseup", onDragEnd);
};

const onDragMove = (e: MouseEvent) => {
  if (!dragPhoto) return;
  dragPhoto.x = e.clientX - dragOffsetX;
  dragPhoto.y = e.clientY - dragOffsetY;
  photoWallStore.updatePhoto(dragPhoto.id, { x: dragPhoto.x, y: dragPhoto.y });
};

const onDragEnd = () => {
  dragPhoto = null;
  window.removeEventListener("mousemove", onDragMove);
  window.removeEventListener("mouseup", onDragEnd);
};

// --- Touch Drag ---
let touchPhoto: PhotoItem | null = null;
let touchOffsetX = 0;
let touchOffsetY = 0;

const onTouchStart = (e: TouchEvent, photo: PhotoItem) => {
  if (e.touches.length !== 1) return;
  const touch = e.touches[0];
  touchPhoto = photo;
  touchOffsetX = touch.clientX - photo.x;
  touchOffsetY = touch.clientY - photo.y;
  window.addEventListener("touchmove", onTouchMove, { passive: false });
  window.addEventListener("touchend", onTouchEnd);
};

const onTouchMove = (e: TouchEvent) => {
  if (!touchPhoto || e.touches.length !== 1) return;
  e.preventDefault();
  const touch = e.touches[0];
  touchPhoto.x = touch.clientX - touchOffsetX;
  touchPhoto.y = touch.clientY - touchOffsetY;
  photoWallStore.updatePhoto(touchPhoto.id, { x: touchPhoto.x, y: touchPhoto.y });
};

const onTouchEnd = () => {
  touchPhoto = null;
  window.removeEventListener("touchmove", onTouchMove);
  window.removeEventListener("touchend", onTouchEnd);
};

// --- Scale ---
const onWheel = (e: WheelEvent, photo: PhotoItem) => {
  const delta = e.deltaY > 0 ? -0.08 : 0.08;
  const newScale = Math.min(5, Math.max(0.1, photo.scale + delta));
  photoWallStore.updatePhoto(photo.id, { scale: newScale });
};

// --- Rotate (right-click drag) ---
let rotatePhoto: PhotoItem | null = null;
let rotateStartX = 0;
let rotateStartRotation = 0;

const onRotateStart = (e: MouseEvent, photo: PhotoItem) => {
  rotatePhoto = photo;
  rotateStartX = e.clientX;
  rotateStartRotation = photo.rotation;
  window.addEventListener("mousemove", onRotateMove);
  window.addEventListener("mouseup", onRotateEnd);
};

const onRotateMove = (e: MouseEvent) => {
  if (!rotatePhoto) return;
  const dx = e.clientX - rotateStartX;
  const newRotation = rotateStartRotation + dx * 0.5;
  rotatePhoto.rotation = newRotation;
  photoWallStore.updatePhoto(rotatePhoto.id, { rotation: newRotation });
};

const onRotateEnd = () => {
  rotatePhoto = null;
  window.removeEventListener("mousemove", onRotateMove);
  window.removeEventListener("mouseup", onRotateEnd);
};

// --- Rotate Handle (left-click on handle) ---
let handlePhoto: PhotoItem | null = null;
let handleStartX = 0;
let handleStartRotation = 0;

const onRotateHandleStart = (e: MouseEvent, photo: PhotoItem) => {
  e.stopPropagation();
  handlePhoto = photo;
  handleStartX = e.clientX;
  handleStartRotation = photo.rotation;
  window.addEventListener("mousemove", onHandleMove);
  window.addEventListener("mouseup", onHandleEnd);
};

const onHandleMove = (e: MouseEvent) => {
  if (!handlePhoto) return;
  const dx = e.clientX - handleStartX;
  const newRotation = handleStartRotation + dx * 0.5;
  handlePhoto.rotation = newRotation;
  photoWallStore.updatePhoto(handlePhoto.id, { rotation: newRotation });
};

const onHandleEnd = () => {
  handlePhoto = null;
  window.removeEventListener("mousemove", onHandleMove);
  window.removeEventListener("mouseup", onHandleEnd);
};

// --- Right Click: rotate in editing mode, pass through otherwise ---
const onPhotoRightClick = (e: MouseEvent, photo: PhotoItem) => {
  if (photoWallStore.editing) {
    e.preventDefault();
    // onRotateStart(e, photo);
  }
};

// --- Double Click Delete ---
const onDoubleClick = (photo: PhotoItem) => {
  photoWallStore.removePhoto(photo.id);
};

// --- Escape to close ---
const onKeyDown = (e: KeyboardEvent) => {
  if (e.key === "Escape" && photoWallStore.visible) {
    photoWallStore.toggle();
  }
};

onMounted(() => {
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("mousemove", onMouseMove);
});

onUnmounted(() => {
  document.removeEventListener("keydown", onKeyDown);
  document.removeEventListener("mousemove", onMouseMove);
});
</script>

<style scoped>
.toolbar-enter-active,
.toolbar-leave-active {
  transition: transform 0.25s ease, opacity 0.25s ease;
}
.toolbar-enter-from,
.toolbar-leave-to {
  transform: translateY(-100%);
  opacity: 0;
  pointer-events: none;
}

.photo-anim {
  will-change: scale, opacity;
  animation: photoPop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both;
}

@keyframes photoPop {
  from {
    scale: 0;
    opacity: 0;
  }
}
</style>
