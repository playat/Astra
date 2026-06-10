<template>
  <div class="liquid-glass" :style="containerStyle">
    <div class="liquid-glass__filter" :style="filterStyle"></div>
    <div class="liquid-glass__specular" :style="specularStyle"></div>
    <div class="liquid-glass__content">
      <slot />
    </div>
  </div>
  <Teleport to="body">
    <svg v-if="!svgInjected" style="position:absolute;width:0;height:0;overflow:hidden">
      <defs>
        <filter :id="filterId" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence
            type="fractalNoise"
            :baseFrequency="`${noiseFrequency} ${noiseFrequency}`"
            numOctaves="2"
            seed="92"
            result="noise"
          />
          <feGaussianBlur in="noise" stdDeviation="2" result="blurred" />
          <feDisplacementMap
            in="SourceGraphic"
            in2="blurred"
            :scale="noiseStrength"
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  </Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';

const props = withDefaults(defineProps<{
  /** 宽度 */
  width?: string | number;
  /** 高度 */
  height?: string | number;
  /** 圆角 */
  borderRadius?: string | number;
  /** 内阴影颜色 */
  innerShadowColor?: string;
  /** 内阴影模糊 */
  innerShadowBlur?: number;
  /** 内阴影扩散 */
  innerShadowSpread?: number;
  /** 玻璃色调颜色 */
  glassTintColor?: string;
  /** 玻璃色调透明度 */
  glassTintOpacity?: number;
  /** 霜冻模糊半径 */
  frostBlurRadius?: number;
  /** 噪声频率 */
  noiseFrequency?: number;
  /** 噪声强度（位移缩放） */
  noiseStrength?: number;
  /** 块级模式 */
  block?: boolean;
}>(), {
  width: 300,
  height: 200,
  borderRadius: 28,
  innerShadowColor: '#ffffff',
  innerShadowBlur: 15,
  innerShadowSpread: -5,
  glassTintColor: '#ffffff',
  glassTintOpacity: 0,
  frostBlurRadius: 0,
  noiseFrequency: 0.008,
  noiseStrength: 77,
  block: false,
});

const filterId = `lg-dist-${Math.random().toString(36).slice(2, 9)}`;
const svgInjected = ref(false);

onMounted(() => {
  svgInjected.value = !!document.getElementById(filterId);
});

const containerStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height,
  borderRadius: typeof props.borderRadius === 'number' ? `${props.borderRadius}px` : props.borderRadius,
  display: props.block ? 'flex' : 'inline-flex',
}));

const filterStyle = computed(() => ({
  backdropFilter: `blur(${props.frostBlurRadius}px)`,
  filter: `url(#${filterId})`,
  background: props.glassTintOpacity > 0
    ? `${props.glassTintColor}${Math.round(props.glassTintOpacity * 255).toString(16).padStart(2, '0')}`
    : 'transparent',
}));

const specularStyle = computed(() => ({
  boxShadow: `inset ${props.innerShadowSpread}px ${props.innerShadowSpread}px ${props.innerShadowBlur}px ${props.innerShadowColor}`,
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
  pointer-events: none;
}

.liquid-glass__content {
  position: relative;
  z-index: 3;
  width: 100%;
  height: 100%;
}
</style>
