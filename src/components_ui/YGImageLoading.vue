<template>
  <div class="loader" ref="loaderRef">
    <span
      class="before"
      :style="{
        boxShadow: `${0.5 * width}px ${-0.53 * width}px 0 ${
          0.08 * width
        }px #ff3d00`,
      }"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";

const loaderRef = ref<HTMLDivElement>();
const width = ref(0);
onMounted(() => {
  width.value = loaderRef.value?.offsetWidth || 0;
});
</script>

<style scoped>
.loader {
  width: 100%;
  height: 100%;
  position: relative;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 4px;
  overflow: hidden;
}

.loader .before {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 62.5%;
  height: 62.5%;
  transform: rotate(45deg) translate(30%, 40%);
  background: #ff9371;

  animation: slide 1s infinite ease-in-out alternate;
}

.loader:after {
  content: "";
  position: absolute;
  left: 16%;
  top: 16%;
  width: 25%;
  height: 25%;
  border-radius: 50%;
  background: #ff3d00;
  transform: rotate(0deg);
  transform-origin: 35px 145px;
  animation: rotate 1s infinite ease-in-out;
}

@keyframes slide {
  0%,
  100% {
    bottom: -55%;
  }

  25%,
  75% {
    bottom: -2px;
  }

  20%,
  80% {
    bottom: 2px;
  }
}

@keyframes rotate {
  0% {
    transform: rotate(-15deg);
  }

  25%,
  75% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(25deg);
  }
}
</style>
