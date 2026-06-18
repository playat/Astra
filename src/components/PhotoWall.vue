<template>
  <!-- Photos layer: visible when not hidden and there are photos -->
  <div
    v-if="!photoWallStore.hidden && photoWallStore.photos.length > 0"
    class="fixed inset-0 z-10"
    :class="{ 'pointer-events-none': !photoWallStore.visible }"
    @contextmenu.prevent="photoWallStore.visible"
  >
    <div
      v-for="photo in photoWallStore.photos"
      :key="photo.id"
      class="absolute select-none"
      :class="photoWallStore.visible ? 'cursor-grab active:cursor-grabbing' : 'pointer-events-none'"
      :style="{
        left: 0,
        top: 0,
        transform: `translate(${photo.x}px, ${photo.y}px) rotate(${photo.rotation}deg) scale(${photo.scale})`,
        zIndex: photo.zIndex,
        transformOrigin: 'center center',
      }"
      @mousedown.left="onDragStart($event, photo)"
      @touchstart.passive="onTouchStart($event, photo)"
      @wheel.prevent="onWheel($event, photo)"
      @mousedown.right.prevent="onRotateStart($event, photo)"
      @dblclick="onDoubleClick(photo)"
      @click.left.stop="photoWallStore.bringToFront(photo.id)"
    >
      <img
        :src="photo.url"
        class="pointer-events-none rounded-lg shadow-2xl border-2 border-white/10 max-w-[300px] max-h-[300px] object-contain"
        draggable="false"
      />
      <!-- Rotate handle: only in edit mode -->
      <div
        v-if="photoWallStore.visible"
        class="absolute -top-3 -right-3 w-6 h-6 bg-white/80 rounded-full flex items-center justify-pointer cursor-grab shadow-md hover:bg-white transition-colors"
        @mousedown.left.stop="onRotateHandleStart($event, photo)"
      >
        <svg class="w-3 h-3 text-gray-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
          <path d="M1 4v6h6" /><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
        </svg>
      </div>
    </div>
  </div>

  <!-- Edit mode overlay + toolbar -->
  <div
    v-if="photoWallStore.visible"
    class="fixed inset-0 z-20 pointer-events-none"
  >
    <!-- Toolbar -->
    <div class="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] pointer-events-auto flex items-center gap-3 px-5 py-3 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10 shadow-2xl">
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
        class="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm transition-colors"
        @click="photoWallStore.toggleHidden()"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
          <line x1="1" y1="1" x2="23" y2="23" />
        </svg>
        隐藏照片墙
      </button>
      <button
        class="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/40 text-red-300 text-sm transition-colors"
        @click="photoWallStore.toggle()"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
        关闭编辑
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
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import usePhotoWall, { type PhotoItem } from "@/store/photoWall";

const photoWallStore = usePhotoWall();
const fileInputRef = ref<HTMLInputElement>();

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
  dragOffsetX = e.clientX - photo.x;
  dragOffsetY = e.clientY - photo.y;
  window.addEventListener("mousemove", onDragMove);
  window.addEventListener("mouseup", onDragEnd);
};

const onDragMove = (e: MouseEvent) => {
  if (!dragPhoto) return;
  photoWallStore.updatePhoto(dragPhoto.id, {
    x: e.clientX - dragOffsetX,
    y: e.clientY - dragOffsetY,
  });
  // update local ref for smooth dragging
  dragPhoto.x = e.clientX - dragOffsetX;
  dragPhoto.y = e.clientY - dragOffsetY;
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
  photoWallStore.updatePhoto(touchPhoto.id, {
    x: touchPhoto.x,
    y: touchPhoto.y,
  });
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
});

onUnmounted(() => {
  document.removeEventListener("keydown", onKeyDown);
});
</script>
