import { ref, onMounted } from 'vue';

const isInjected = ref(false);

/** 全局注入液态玻璃 SVG 滤镜（只需调用一次） */
export function useLiquidGlassFilter() {
  onMounted(() => {
    if (isInjected.value || document.getElementById('lg-dist')) {
      isInjected.value = true;
      return;
    }

    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'liquid-glass-svg-defs');
    svg.setAttribute('style', 'position:absolute;width:0;height:0;overflow:hidden');
    svg.innerHTML = `
      <defs>
        <filter id="lg-dist" x="-20%" y="-20%" width="140%" height="140%">
          <feTurbulence type="fractalNoise" baseFrequency="0.008 0.008" numOctaves="2" seed="92" result="noise"/>
          <feGaussianBlur in="noise" stdDeviation="2" result="blurred"/>
          <feDisplacementMap in="SourceGraphic" in2="blurred" scale="70" xChannelSelector="R" yChannelSelector="G"/>
        </filter>
      </defs>
    `;
    document.body.appendChild(svg);
    isInjected.value = true;
  });

  return { isInjected };
}
