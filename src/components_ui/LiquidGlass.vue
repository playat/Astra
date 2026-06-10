<template>
  <div class="liquid-glass" :style="containerStyle">
    <div class="liquid-glass__filter" :style="filterStyle"></div>
    <div class="liquid-glass__specular"></div>
    <div class="liquid-glass__content">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useLiquidGlassFilter } from '@/composables/useLiquidGlass';

const props = withDefaults(defineProps<{
  /** 折射强度 */
  intensity?: number;
  /** 噪声频率 */
  frequency?: number;
  /** 噪声模糊程度 */
  blur?: number;
  /** 背景模糊程度 */
  backdropBlur?: number;
  /** 圆角 */
  radius?: string | number;
  /** 宽度 */
  width?: string | number;
  /** 高度 */
  height?: string | number;
  /** 背景透明度 */
  backgroundOpacity?: number;
  /** 块级模式 */
  block?: boolean;
}>(), {
  intensity: 70,
  frequency: 0.008,
  blur: 2,
  backdropBlur: 4,
  radius: 'inherit',
  width: 'auto',
  height: 'auto',
  backgroundOpacity: 0.25,
  block: false,
});

useLiquidGlassFilter();

const containerStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
  borderRadius: typeof props.radius === 'number' ? `${props.radius}px` : props.radius,
  background: `rgba(255, 255, 255, ${props.backgroundOpacity})`,
  display: props.block ? 'flex' : 'inline-flex',
}));

const filterStyle = computed(() => ({
  backdropFilter: `blur(${props.backdropBlur}px)`,
  filter: 'url(#lg-dist)',
}));
</script>

<style scoped>
.liquid-glass {
  position: relative;
  overflow: hidden;
  box-shadow: 0 6px 6px rgba(0, 0, 0, 0.2), 0 0 20px rgba(0, 0, 0, 0.1);
}

.liquid-glass__filter {
  position: absolute;
  inset: 0;
  z-index: 0;
  isolation: isolate;
}

.liquid-glass__specular {
  position: absolute;
  inset: 0;
  z-index: 2;
  border-radius: inherit;
  box-shadow:
    inset 1px 1px 0 rgba(255, 255, 255, 0.75),
    inset 0 0 5px rgba(255, 255, 255, 0.75);
  pointer-events: none;
}

.liquid-glass__content {
  position: relative;
  z-index: 3;
  width: 100%;
  height: 100%;
}
</style>
