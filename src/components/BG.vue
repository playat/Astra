<template>
  <div
    ref="bgRef"
    class="w-full h-full relative scale-120 bg-black"
    @click="reset"
    @contextmenu="contextMenu"
  >
    <video
      v-if="appStore.bgCfn.type === 'video'"
      ref="videoRef"
      loop
      muted
      autoplay
      :src="appStore.bgCfn.url"
      @loadeddata="animate"
      class="w-full h-full object-cover"
    />
    <img
      v-if="appStore.bgCfn.type === 'image'"
      :src="appStore.bgCfn.url"
      @load="animate"
      class="w-full h-full object-cover"
    />
    <div
      ref="bgMaskRef"
      class="absolute inset-0"
      :class="appStore.isMore ? 'backdrop-blur-[6px]' : ''"
    />
  </div>
</template>

<script setup lang="ts">
import useApp from "@/store/app";
import { ref, onMounted, onUnmounted } from "vue";
import gsap from "gsap";
const appStore = useApp();
const bgMaskRef = ref();
const bgRef = ref();
const videoRef = ref<HTMLVideoElement>();
const reset = () => {
  appStore.isMore = false;
};

const contextMenu = (e) => {
  e.preventDefault();
  appStore.isMore = true;
};

const animate = () => {
  gsap.fromTo(
    bgMaskRef.value,
    {
      background: `rgba(0,0,0,0.1)`,
    },
    {
      background: `rgba(0,0,0,0.3)`,
      duration: 1.5,
    }
  );
  gsap.fromTo(
    bgRef.value,
    {
      filter: "blur(6px)",
    },
    {
      scale: "1 1",
      filter: "blur(0px)",
      duration: 1.5,
      ease: "power2.out",
    }
  );
};

const handleVisibility = () => {
  if (!videoRef.value) return;
  if (document.hidden) {
    videoRef.value.pause();
  } else {
    videoRef.value.play().catch(() => {});
  }
};

onMounted(() => {
  document.addEventListener("visibilitychange", handleVisibility);
});

onUnmounted(() => {
  document.removeEventListener("visibilitychange", handleVisibility);
});
</script>
