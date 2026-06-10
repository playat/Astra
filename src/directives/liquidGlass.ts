import type { Directive, App } from 'vue';

interface LiquidGlassOptions {
  width?: string | number;
  height?: string | number;
  borderRadius?: string | number;
  innerShadowColor?: string;
  innerShadowBlur?: number;
  innerShadowSpread?: number;
  glassTintColor?: string;
  glassTintOpacity?: number;
  frostBlurRadius?: number;
  noiseFrequency?: number;
  noiseStrength?: number;
  block?: boolean;
}

const defaults: Required<LiquidGlassOptions> = {
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
};

const svgMap = new WeakMap<HTMLElement, SVGElement>();

function toUnit(v: string | number): string {
  return typeof v === 'number' ? `${v}px` : v;
}

function hexToRgba(hex: string, opacity: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

function applyStyles(el: HTMLElement, opts: Required<LiquidGlassOptions>) {
  el.classList.add('liquid-glass');
  el.style.setProperty('--lg-width', toUnit(opts.width));
  el.style.setProperty('--lg-height', toUnit(opts.height));
  el.style.setProperty('--lg-border-radius', toUnit(opts.borderRadius));
  el.style.setProperty('--lg-inner-shadow',
    `inset ${opts.innerShadowSpread}px ${opts.innerShadowSpread}px ${opts.innerShadowBlur}px ${opts.innerShadowColor}`);
  el.style.setProperty('--lg-tint', hexToRgba(opts.glassTintColor, opts.glassTintOpacity));
  el.style.setProperty('--lg-frost-blur', `${opts.frostBlurRadius}px`);
  el.dataset.lgBlock = String(opts.block);
}

function createSvg(filterId: string, opts: Required<LiquidGlassOptions>): SVGElement {

// <svg xmlns="http://www.w3.org/2000/svg" style="display: none;">
//   <defs>
//     <filter id="glass-distortion" x="0%" y="0%" width="100%" height="100%">
//       <feTurbulence type="fractalNoise" baseFrequency="0.008 0.008" numOctaves="2" seed="92" result="noise" />
//       <feGaussianBlur in="noise" stdDeviation="2" result="blurred" />
//       <feDisplacementMap in="SourceGraphic" in2="blurred" scale="77" xChannelSelector="R" yChannelSelector="G" />
//     </filter>
//   </defs>
// </svg>
  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('style', 'display: none;');

  const defs = document.createElementNS(ns, 'defs');
  const filter = document.createElementNS(ns, 'filter');
  filter.id = filterId;
  filter.setAttribute('x', '0%');
  filter.setAttribute('y', '0%');
  filter.setAttribute('width', '100%');
  filter.setAttribute('height', '100%');

  const turbulence = document.createElementNS(ns, 'feTurbulence');
  turbulence.setAttribute('type', 'fractalNoise');
  turbulence.setAttribute('baseFrequency', `${opts.noiseFrequency} ${opts.noiseFrequency}`);
  turbulence.setAttribute('numOctaves', '2');
  turbulence.setAttribute('seed', '92');
  turbulence.setAttribute('result', 'noise');

  const blur = document.createElementNS(ns, 'feGaussianBlur');
  blur.setAttribute('in', 'noise');
  blur.setAttribute('stdDeviation', '2');
  blur.setAttribute('result', 'blurred');

  const displacement = document.createElementNS(ns, 'feDisplacementMap');
  displacement.setAttribute('in', 'SourceGraphic');
  displacement.setAttribute('in2', 'blurred');
  displacement.setAttribute('scale', String(opts.noiseStrength));
  displacement.setAttribute('xChannelSelector', 'R');
  displacement.setAttribute('yChannelSelector', 'G');

  filter.append(turbulence, blur, displacement);
  defs.append(filter);
  svg.append(defs);
  return svg;
}

function updateSvg(svg: SVGElement, opts: Required<LiquidGlassOptions>) {
  const turbulence = svg.querySelector('feTurbulence')!;
  const displacement = svg.querySelector('feDisplacementMap')!;
  turbulence.setAttribute('baseFrequency', `${opts.noiseFrequency} ${opts.noiseFrequency}`);
  displacement.setAttribute('scale', String(opts.noiseStrength));
}

function resolveOpts(value: LiquidGlassOptions | undefined): Required<LiquidGlassOptions> {
  return { ...defaults, ...value };
}

const vLiquidGlass: Directive<HTMLElement, LiquidGlassOptions | undefined> = {
  mounted(el, binding) {
    console.log("调用液态玻璃指令");
    
    const opts = resolveOpts(binding.value);
    const filterId = `lg-${Math.random().toString(36).slice(2, 9)}`;

    const svg = createSvg(filterId, opts);
    document.body.appendChild(svg);
    svgMap.set(el, svg);

    el.style.setProperty('--lg-filter', `url(#${filterId})`);
    el.classList.add('liquid-glass');
    applyStyles(el, opts);
  },

  updated(el, binding) {
    const svg = svgMap.get(el);
    if (!svg) return;
    const opts = resolveOpts(binding.value);
    updateSvg(svg, opts);
    applyStyles(el, opts);
  },

  unmounted(el) {
    const svg = svgMap.get(el);
    if (svg) {
      svg.remove();
      svgMap.delete(el);
    }
  },
};

export const liquidGlass = {
  install(app: App) {
    app.directive('liquid-glass', vLiquidGlass);
  },
};

export { vLiquidGlass };
export type { LiquidGlassOptions };
