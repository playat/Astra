<template>
  <div
    class="relative w-[86vw] max-w-[1040px] text-white max-h-[78vh] overflow-y-auto overflow-x-hidden scrollbar-none p-[5px]"
  >
    <!-- ── 顶部标题 ── -->
    <div class="flex items-end justify-between gap-4 px-1 pb-4">
      <div class="flex items-center gap-3">
        <div
          class="w-[3px] h-9 rounded-full bg-gradient-to-b from-pink-300 to-violet-500"
        ></div>
        <div>
          <div class="text-xs uppercase tracking-[0.28em] text-white/35">
            cycle log
          </div>
          <div class="text-base font-semibold tracking-wide">生理期记录</div>
        </div>
      </div>
      <div class="text-right font-mono text-xs leading-5 text-white/40">
        <div>{{ sorted.length }} 次记录</div>
        <div v-if="spanText">{{ spanText }}</div>
      </div>
    </div>

    <!-- ── 空状态 ── -->
    <div
      v-if="!sorted.length && !loading"
      class="flex flex-col items-center justify-center gap-3 py-14 text-white/40"
    >
      <div class="text-3xl opacity-40">◍</div>
      <div class="text-xs tracking-widest">还没有记录，先记下第一次日期吧</div>
      <div class="w-32">
        <YGButton block @click="add">记录</YGButton>
      </div>
    </div>

    <template v-else>
      <!-- ── 关键指标 ── -->
      <div class="grid grid-cols-2 gap-2.5 md:grid-cols-4">
        <div v-for="s in stats" :key="s.label" class="stat-card">
          <div class="stat-label">{{ s.label }}</div>
          <div class="stat-value">
            {{ s.value
            }}<span v-if="s.unit" class="stat-unit">{{ s.unit }}</span>
          </div>
          <div class="stat-sub">{{ s.sub }}</div>
        </div>
      </div>

      <!-- ── 周期长度趋势 ── -->
      <section v-if="cycles.length" class="mt-5">
        <div
          class="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 px-1 pb-2"
        >
          <div class="text-xs tracking-[0.2em] text-white/70">周期长度趋势</div>
          <div
            class="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-white/40"
          >
            <span class="flex items-center gap-1.5">
              <i class="legend-band"></i>
              常见区间 {{ bandLabel }}
            </span>
            <span class="flex items-center gap-1.5">
              <i class="legend-dot bg-amber-400/80"></i>
              长间隔
            </span>
            <span class="flex items-center gap-1.5">
              <i class="legend-line"></i>
              平均
            </span>
          </div>
        </div>

        <!-- tip 挂在滚动容器外层，避免被 overflow 裁掉 -->
        <div ref="chartShell" class="relative">
          <div
            ref="scrollRef"
            class="chart-scroller overflow-x-auto overflow-y-hidden scrollbar-none"
            :class="{ 'is-dragging': dragging }"
            @scroll="syncTip"
            @wheel="onWheel"
            @pointerdown="onPointerDown"
            @pointermove="onPointerMove"
            @pointerup="onPointerUp"
            @pointercancel="onPointerUp"
          >
            <div
              class="relative"
              :style="{ width: chartWidth + 'px', height: chartH + 'px' }"
              @mouseleave="hoverIndex = -1"
            >
              <svg
                :width="chartWidth"
                :height="chartH"
                :viewBox="`0 0 ${chartWidth} ${chartH}`"
                class="block"
              >
                <defs>
                  <linearGradient id="phyBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stop-color="#f9a8d4" />
                    <stop offset="100%" stop-color="#8e6ff7" />
                  </linearGradient>
                </defs>

                <!-- 常见区间：用你自己数据的中间 50%（Q1–Q3），不是拍一个标准值 -->
                <rect
                  x="0"
                  :y="bandY"
                  :width="chartWidth"
                  :height="Math.max(1, bandH)"
                  fill="rgba(142,111,247,0.13)"
                />
                <line
                  x1="0"
                  :x2="chartWidth"
                  :y1="bandY"
                  :y2="bandY"
                  stroke="rgba(142,111,247,0.3)"
                  stroke-dasharray="3 5"
                />
                <line
                  x1="0"
                  :x2="chartWidth"
                  :y1="bandY + bandH"
                  :y2="bandY + bandH"
                  stroke="rgba(142,111,247,0.3)"
                  stroke-dasharray="3 5"
                />

                <!-- 年份分隔 -->
                <g v-for="t in yearTicks" :key="'year-' + t.i">
                  <line
                    :x1="t.x"
                    :x2="t.x"
                    :y1="padT - 6"
                    :y2="chartH - padB"
                    stroke="rgba(255,255,255,0.08)"
                    stroke-dasharray="2 6"
                  />
                  <text :x="t.x + 6" :y="padT - 14" class="ct-year">
                    {{ t.year }}
                  </text>
                </g>

                <!-- 平均线 -->
                <line
                  x1="0"
                  :x2="chartWidth"
                  :y1="avgY"
                  :y2="avgY"
                  stroke="rgba(255,255,255,0.42)"
                  stroke-dasharray="6 5"
                />
                <text
                  :x="chartWidth - 8"
                  :y="avgY - 7"
                  text-anchor="end"
                  class="ct-avg"
                >
                  平均 {{ avgLabel }}
                </text>

                <!-- 柱子 -->
                <g v-for="(c, i) in cycles" :key="'bar-' + i">
                  <rect
                    :x="barX(i)"
                    :y="barTop(c.days)"
                    :width="barW"
                    :height="Math.max(3, chartH - padB - barTop(c.days))"
                    rx="4"
                    :fill="barFill(c)"
                    :stroke="c.approx ? 'rgba(255,255,255,0.42)' : 'none'"
                    :stroke-width="c.approx ? 1 : 0"
                    :stroke-dasharray="c.approx ? '3 3' : undefined"
                    :opacity="hoverIndex === -1 || hoverIndex === i ? 1 : 0.35"
                    class="bar-rect"
                  />
                  <text
                    :x="barX(i) + barW / 2"
                    :y="valY(c)"
                    text-anchor="middle"
                    class="ct-val"
                    :class="{
                      'ct-val--warn': !c.approx && isOutlier(c.days),
                      'ct-val--soft': c.approx,
                    }"
                    :opacity="hoverIndex === -1 || hoverIndex === i ? 1 : 0.35"
                  >
                    {{ c.approx ? "~" : ""
                    }}{{ isClipped(c.days) ? c.days + "+" : c.days }}
                  </text>
                  <text
                    v-if="showLabel(i)"
                    :x="barX(i) + barW / 2"
                    :y="chartH - padB + 16"
                    text-anchor="middle"
                    class="ct-x"
                  >
                    {{ monthLabel(c.start) }}
                  </text>
                  <!-- hover 热区 -->
                  <rect
                    :x="barX(i) - (barStep - barW) / 2"
                    :y="padT"
                    :width="barStep"
                    :height="chartH - padT - padB"
                    fill="transparent"
                    @mouseenter="hoverIndex = i"
                  />
                </g>
              </svg>
            </div>
          </div>

          <!-- 悬浮提示：位置由 JS 按可视区域夹取，靠边自动翻转 -->
          <div
            v-if="hoverCycle"
            ref="tipEl"
            class="chart-tip"
            :style="{
              left: tipPos.left + 'px',
              top: tipPos.top + 'px',
              opacity: tipReady ? 1 : 0,
            }"
          >
            <i
              class="chart-tip-arrow"
              :class="{ 'chart-tip-arrow--below': tipPos.below }"
              :style="{ left: tipArrowX + 'px' }"
            ></i>
            <div class="font-mono text-xs text-white/80">
              {{ hoverCycle.startLabel }} → {{ hoverCycle.endLabel }}
            </div>
            <div class="mt-1 text-xs">
              <span
                class="font-semibold"
                :class="
                  hoverCycle.approx
                    ? 'text-white/60'
                    : isOutlier(hoverCycle.days)
                    ? 'text-amber-300'
                    : 'text-violet-300'
                "
                >{{ hoverCycle.approx ? "约 " : ""
                }}{{ hoverCycle.days }} 天</span
              >
              <span class="text-white/45 ml-2">{{
                statusText(hoverCycle)
              }}</span>
            </div>
          </div>
        </div>

        <!-- 图例说明：把读图规则写清楚 -->
        <div
          class="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-1 pt-2 text-xs text-white/30"
        >
          <span>每根柱子 = 相邻两次记录的间隔天数</span>
          <span class="text-white/25">滚轮或按住拖动可横向查看</span>
          <span>
            医学参考 {{ REF_MIN }}–{{ REF_MAX }} 天 · 超过
            {{ Math.round(highFence) }} 天计为长间隔
          </span>
        </div>
      </section>

      <!-- ── 多年总览 + 最近记录 ── -->
      <div class="mt-4 flex flex-col gap-3 md:flex-row">
        <!-- 多年总览：一年一行，12 列 = 12 个月，格内数字是当月真实记录的「日」 -->
        <section class="min-w-0 flex-1">
          <div class="flex flex-wrap items-baseline justify-between gap-x-3 px-1 pb-2">
            <div class="text-xs tracking-[0.2em] text-white/70">多年总览</div>
            <div class="text-xs text-white/35">
              格内数字 = 当月记录的真实日，空白 = 无记录
            </div>
          </div>

          <div class="cal-wrap">
            <div class="cal-head">
              <div class="cal-corner">年月</div>
              <div v-for="m in 12" :key="'cm-' + m" class="cal-month">
                {{ m }}
              </div>
              <div class="cal-total-head">次</div>
            </div>

            <div class="cal-body">
              <div v-for="row in yearRows" :key="row.year" class="cal-row">
                <div class="cal-year">{{ row.year }}</div>
                <div
                  v-for="(cell, m) in row.months"
                  :key="row.year + '-' + m"
                  class="cal-cell"
                  :class="{ 'cal-cell--on': cell.count > 0 }"
                  :title="cell.title"
                >
                  <span v-for="d in cell.days" :key="d" class="cal-date">{{
                    d
                  }}</span>
                  <span v-if="cell.unknown" class="cal-date cal-date--q">?</span>
                </div>
                <div class="cal-total">{{ row.total }}</div>
              </div>
            </div>
          </div>
        </section>

        <!-- 最近记录 -->
        <section v-if="recent.length" class="w-full md:w-[300px] md:shrink-0">
          <div class="px-1 pb-2 text-xs tracking-[0.2em] text-white/70">
            最近记录
          </div>
          <div class="panel-block">
            <div
              v-for="(r, i) in recent"
              :key="'rc-' + i"
              class="flex items-center gap-2 border-b border-white/[0.06] py-2 text-xs last:border-b-0"
            >
              <span class="w-[76px] font-mono text-white/80">{{ r.start }}</span>
              <span
                class="font-mono"
                :class="
                  r.approx
                    ? 'text-white/35'
                    : r.days && isOutlier(r.days)
                    ? 'text-amber-300'
                    : 'text-white/45'
                "
                >{{ r.days ? (r.approx ? "~" : "") + r.days + "d" : "—" }}</span
              >
              <span class="ml-auto text-xs" :class="r.tagClass">{{
                r.tag
              }}</span>
            </div>
          </div>
        </section>
      </div>

      <!-- ── 操作 ── -->
      <div class="mt-5 flex flex-wrap items-center justify-center gap-3">
        <div class="w-28"><YGButton block @click="add">记录</YGButton></div>
        <div class="w-28">
          <YGButton block :loading="exportLoading" @click="exportData"
            >导出</YGButton
          >
        </div>
        <div class="w-28">
          <YGButton block :loading="importLoading" @click="importData"
            >导入</YGButton
          >
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, h, nextTick, onMounted, onUnmounted, ref, watch } from "vue";
import {
  exportPhysiology,
  getPhysiology,
  importPhysiology,
} from "@/api/physiology";
import YGButton from "@/components_ui/YGButton.vue";
import AddPhysiology from "../components_system/AddPhysiology.vue";
import CoverDialog from "@/components_ui/CoverDialog";

interface PhyRecord {
  id?: string | number;
  happen: string;
}

interface Cycle {
  /** 完整日期，缺「日」时按 1 号占位，只用于取年份 / 月份刻度 */
  start: string;
  end: string;
  /** 展示用：缺「日」时只显示到月 */
  startLabel: string;
  endLabel: string;
  days: number;
  /** 有一端只记录到月份，天数只是约值，不参与统计 */
  approx: boolean;
}

const DAY_MS = 86400000;
/** 医学参考区间，只做文字说明，不作为判定基准 */
const REF_MIN = 21;
const REF_MAX = 35;

/* ── 布局常量 ── */
const barStep = 34;
const barW = 20;
const chartH = 214;
const padT = 26;
const padB = 34;
/** tip 与柱顶的间距 */
const TIP_GAP = 8;

const records = ref<PhyRecord[]>([]);
const loading = ref(false);
const hoverIndex = ref(-1);
const scrollRef = ref<HTMLElement>();
/** 定位壳：tip 相对它定位，因此不会被横向滚动容器的 overflow 裁掉 */
const chartShell = ref<HTMLElement>();
const tipEl = ref<HTMLElement>();

/** 拆出年 / 月 / 日；「日」缺失时为 null（例如记录写成 "2023-6"） */
const splitDate = (s: string) => {
  const p = String(s).slice(0, 10).split(/[-/.]/).map(Number);
  return {
    y: Number.isFinite(p[0]) ? p[0] : 1970,
    m: Number.isFinite(p[1]) ? p[1] : 1,
    d: Number.isFinite(p[2]) && p[2] > 0 ? (p[2] as number) : null,
  };
};
const pad = (n: number) => String(n).padStart(2, "0");
const toDate = (p: { y: number; m: number; d: number | null }) =>
  new Date(p.y, p.m - 1, p.d ?? 1);
const fmtLabel = (p: { y: number; m: number; d: number | null }) =>
  p.d === null ? `${p.y}-${pad(p.m)}` : `${p.y}-${pad(p.m)}-${pad(p.d)}`;
const fmt = (d: Date) =>
  `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseDate = (s: string) => toDate(splitDate(s));

const sorted = computed(() =>
  [...records.value]
    .filter((r) => r && r.happen)
    .sort((a, b) => parseDate(a.happen).getTime() - parseDate(b.happen).getTime())
);

/** 每个完整周期（相邻两次记录之间） */
const cycles = computed<Cycle[]>(() => {
  const list = sorted.value;
  const out: Cycle[] = [];
  for (let i = 0; i < list.length - 1; i++) {
    const a = splitDate(list[i].happen);
    const b = splitDate(list[i + 1].happen);
    const s = toDate(a);
    const e = toDate(b);
    out.push({
      start: fmt(s),
      end: fmt(e),
      startLabel: fmtLabel(a),
      endLabel: fmtLabel(b),
      days: Math.round((e.getTime() - s.getTime()) / DAY_MS),
      approx: a.d === null || b.d === null,
    });
  }
  return out;
});

/** 缺「日」的周期天数不确定，统计一律排除 */
const solidCycles = computed(() => cycles.value.filter((c) => !c.approx));
const solidDays = computed(() => solidCycles.value.map((c) => c.days));

const quantile = (arr: number[], p: number) => {
  if (!arr.length) return 0;
  const s = [...arr].sort((a, b) => a - b);
  const pos = (s.length - 1) * p;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return s[lo] + (s[hi] - s[lo]) * (pos - lo);
};

const medianDays = computed(() => quantile(solidDays.value, 0.5));
const q1Days = computed(() => quantile(solidDays.value, 0.25));
const q3Days = computed(() => quantile(solidDays.value, 0.75));
const iqr = computed(() => q3Days.value - q1Days.value);
/** 1.5 倍四分位距之外视为长 / 短间隔（箱线图惯例） */
const lowFence = computed(() => q1Days.value - 1.5 * iqr.value);
const highFence = computed(() => q3Days.value + 1.5 * iqr.value);

const lastRecord = computed(() => sorted.value[sorted.value.length - 1]);
const sinceLast = computed(() => {
  if (!lastRecord.value) return null;
  return Math.floor(
    (Date.now() - parseDate(lastRecord.value.happen).getTime()) / DAY_MS
  );
});

const avgDays = computed(() => {
  if (!solidDays.value.length) return 0;
  return solidDays.value.reduce((a, b) => a + b, 0) / solidDays.value.length;
});
const avgLabel = computed(() => `${avgDays.value.toFixed(1)} 天`);
const minDays = computed(() =>
  solidDays.value.length ? Math.min(...solidDays.value) : 0
);
const maxDays = computed(() =>
  solidDays.value.length ? Math.max(...solidDays.value) : 0
);
const bandLabel = computed(
  () => `${Math.round(q1Days.value)}–${Math.round(q3Days.value)} 天`
);

const spanText = computed(() => {
  if (sorted.value.length < 2) return "";
  const a = parseDate(sorted.value[0].happen);
  const b = parseDate(sorted.value[sorted.value.length - 1].happen);
  const years = ((b.getTime() - a.getTime()) / DAY_MS / 365.25).toFixed(1);
  return `${fmt(a).slice(0, 7)} ~ ${fmt(b).slice(0, 7)} · ${years} 年`;
});

const stats = computed(() => {
  const last = lastRecord.value;
  const since = sinceLast.value;
  const lastParts = last ? splitDate(last.happen) : null;
  return [
    {
      label: "最近一次",
      value: lastParts
        ? lastParts.d === null
          ? `${pad(lastParts.m)} 月`
          : `${pad(lastParts.m)}-${pad(lastParts.d)}`
        : "--",
      unit: "",
      sub: lastParts
        ? `${lastParts.y} 年${lastParts.d === null ? " · 未记到天" : ""}`
        : "暂无记录",
    },
    {
      label: "距上次",
      value: since === null ? "--" : String(since),
      unit: "天",
      sub: since === null ? "暂无记录" : "今天 − 最近一次记录",
    },
    {
      label: "平均周期",
      value: solidCycles.value.length ? avgDays.value.toFixed(1) : "--",
      unit: "天",
      sub: solidCycles.value.length
        ? `中位 ${Math.round(medianDays.value)} 天 · ${solidCycles.value.length} 个周期`
        : "至少需要两次记录",
    },
    {
      label: "最短 / 最长",
      value: solidCycles.value.length
        ? `${minDays.value} / ${maxDays.value}`
        : "--",
      unit: solidCycles.value.length ? "天" : "",
      sub: solidCycles.value.length
        ? `常见 ${bandLabel.value}`
        : "暂无完整周期",
    },
  ];
});

/* ── 图表刻度 ── */
/** 纵轴按 1.5 倍四分位距上界取值，极端长间隔不会把整体压扁 */
const yMax = computed(() =>
  Math.max(44, Math.ceil((highFence.value + 4) / 2) * 2)
);
const plotH = computed(() => chartH - padT - padB);
const yOf = (v: number) => padT + (1 - v / yMax.value) * plotH.value;
const chartWidth = computed(() =>
  Math.max(560, cycles.value.length * barStep + 16)
);
const barX = (i: number) => 8 + i * barStep + (barStep - barW) / 2;

const bandY = computed(() => yOf(q3Days.value));
const bandH = computed(() =>
  Math.max(0, yOf(q1Days.value) - yOf(q3Days.value))
);
const avgY = computed(() => yOf(avgDays.value));

const isOutlier = (d: number) =>
  solidDays.value.length > 0 && (d > highFence.value || d < lowFence.value);
const statusText = (c: Cycle) =>
  c.approx
    ? "日期未记到天，约值"
    : c.days > highFence.value
    ? "长间隔"
    : c.days < lowFence.value
    ? "短间隔"
    : "常见范围";

const barTop = (d: number) => Math.max(padT, yOf(d));
const isClipped = (d: number) => yOf(d) < padT;
const barBottom = chartH - padB;
/** 数字统一压在柱身内顶部：既不和平均线标签打架，也不会串到邻柱上方 */
const valY = (c: Cycle) => Math.min(barTop(c.days) + 15, barBottom - 6);
const barFill = (c: Cycle) =>
  c.approx
    ? "rgba(255,255,255,0.12)"
    : isOutlier(c.days)
    ? "rgba(251,191,36,0.8)"
    : "url(#phyBar)";

const yearTicks = computed(() => {
  const out: { i: number; x: number; year: number }[] = [];
  let prev = -1;
  cycles.value.forEach((c, i) => {
    const y = Number(c.start.slice(0, 4));
    if (y !== prev) {
      out.push({ i, x: barX(i) + barW / 2, year: y });
      prev = y;
    }
  });
  return out;
});

const labelStep = computed(() => Math.max(1, Math.ceil(cycles.value.length / 12)));
const showLabel = (i: number) =>
  i === 0 ||
  i === cycles.value.length - 1 ||
  i % labelStep.value === 0;
const monthLabel = (s: string) => `${Number(s.slice(5, 7))}月`;

const hoverCycle = computed(() =>
  hoverIndex.value >= 0 ? cycles.value[hoverIndex.value] : null
);

/* ── 悬浮提示定位 ──
 * tip 挂在横向滚动容器外层的定位壳里，坐标相对可视区域计算：
 * 水平靠边时自动收进边界，顶部空间不足时翻到柱顶下方。
 */
const tipPos = ref({ left: 0, top: 0, below: false });
const tipReady = ref(false);
const tipArrowX = ref(0);

const computeTip = () => {
  const i = hoverIndex.value;
  const shell = chartShell.value;
  const tip = tipEl.value;
  if (i < 0 || !shell || !tip) return;

  const c = cycles.value[i];
  const sw = shell.clientWidth;
  const sh = shell.clientHeight;
  const tw = tip.offsetWidth;
  const th = tip.offsetHeight;

  // 柱子中心换算到可视区域（减掉横向滚动量）
  const cx = barX(i) + barW / 2 - (scrollRef.value?.scrollLeft ?? 0);
  const barY = barTop(c.days);

  // 竖直：优先放柱顶上方，放不下就翻到柱顶下方，最后夹在画布内
  let below = false;
  let top = barY - th - TIP_GAP;
  if (top < 2) {
    below = true;
    top = barY + TIP_GAP;
  }
  top = Math.max(2, Math.min(top, sh - th - 2));

  // 水平：左右都留 4px，避免贴边被裁
  const left = Math.max(4, Math.min(cx - tw / 2, sw - tw - 4));

  tipArrowX.value = Math.max(12, Math.min(cx - left, tw - 12));
  tipPos.value = { left, top, below };
  tipReady.value = true;
};

/** 横向滚动时同步位置，避免 tip 与柱子错位 */
const syncTip = () => {
  if (hoverIndex.value >= 0) computeTip();
};

/* ── 横向浏览：滚轮直接横滚 + 按住拖拽平移 ── */
const dragging = ref(false);
const dragState = { active: false, startX: 0, startLeft: 0 };

const maxScroll = () => {
  const el = scrollRef.value;
  return el ? Math.max(0, el.scrollWidth - el.clientWidth) : 0;
};

/** 普通滚轮（deltaY）也转成横向滚动；滚到两端后放行，交给对话框纵向滚动 */
const onWheel = (e: WheelEvent) => {
  const el = scrollRef.value;
  const max = maxScroll();
  if (!el || max <= 0) return;

  // deltaMode: 0=像素 1=行 2=页
  const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? el.clientWidth : 1;
  const raw = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
  const delta = raw * unit;
  if (!delta) return;

  const next = el.scrollLeft + delta;
  if ((delta < 0 && next <= 0) || (delta > 0 && next >= max)) return;
  if (e.cancelable) e.preventDefault();
  el.scrollLeft = Math.max(0, Math.min(max, next));
};

const onPointerDown = (e: PointerEvent) => {
  const el = scrollRef.value;
  if (!el || e.button !== 0 || e.pointerType === "touch") return;
  if (maxScroll() <= 0) return;
  dragState.active = true;
  dragState.startX = e.clientX;
  dragState.startLeft = el.scrollLeft;
  dragging.value = true;
  el.setPointerCapture?.(e.pointerId);
};

const onPointerMove = (e: PointerEvent) => {
  if (!dragState.active) return;
  const el = scrollRef.value;
  if (!el) return;
  e.preventDefault();
  el.scrollLeft = dragState.startLeft - (e.clientX - dragState.startX);
};

const onPointerUp = (e?: PointerEvent) => {
  if (!dragState.active) return;
  dragState.active = false;
  dragging.value = false;
  const el = scrollRef.value;
  if (el && e && el.hasPointerCapture?.(e.pointerId)) {
    el.releasePointerCapture?.(e.pointerId);
  }
};

watch(hoverIndex, (i) => {
  tipReady.value = false;
  if (i < 0) return;
  // 等 tip 渲染出来量到真实宽高，再算最终位置
  nextTick(computeTip);
});

/* ── 多年总览：年份 × 月份，直接落原始记录里的「日」 ── */
const yearRows = computed(() => {
  const map = new Map<number, { days: number[]; unknown: boolean }[]>();
  for (const r of sorted.value) {
    const p = splitDate(r.happen);
    if (!map.has(p.y)) {
      map.set(
        p.y,
        Array.from({ length: 12 }, () => ({ days: [] as number[], unknown: false }))
      );
    }
    const cell = map.get(p.y)![p.m - 1];
    if (p.d === null) {
      cell.unknown = true; // 只记录到月份，不替它补一个「日」
    } else if (!cell.days.includes(p.d)) {
      cell.days.push(p.d); // 同一天重复记录只显示一次
    }
  }
  return [...map.entries()]
    .sort((a, b) => b[0] - a[0]) // 最近的年份在最上面
    .map(([year, months]) => ({
      year,
      total: months.reduce((a, m) => a + m.days.length + (m.unknown ? 1 : 0), 0),
      months: months.map((cell, i) => {
        const days = [...cell.days].sort((x, y) => x - y);
        const parts: string[] = [];
        if (days.length) parts.push(days.map((x) => `${x} 日`).join("、"));
        if (cell.unknown) parts.push("日期只记到月份");
        return {
          days,
          unknown: cell.unknown,
          count: days.length + (cell.unknown ? 1 : 0),
          title: parts.length
            ? `${year}-${pad(i + 1)} 月：${parts.join(" · ")}`
            : `${year}-${pad(i + 1)} 月：无记录`,
        };
      }),
    }));
});

/* ── 最近记录 ── */
const recent = computed(() => {
  const rows = cycles.value
    .slice(-6)
    .reverse()
    .map((c) => ({
      start: c.startLabel,
      days: c.days,
      approx: c.approx,
      tag: statusText(c),
      tagClass: c.approx
        ? "tag tag--muted"
        : isOutlier(c.days)
        ? "tag tag--warn"
        : "tag tag--ok",
    }));

  const last = lastRecord.value;
  if (last) {
    rows.unshift({
      start: fmtLabel(splitDate(last.happen)),
      days: 0,
      approx: false,
      tag: sinceLast.value !== null ? `已 ${sinceLast.value} 天` : "",
      tagClass: "tag tag--live",
    });
  }
  return rows.slice(0, 7);
});

/* ── 数据加载 ── */
const load = async () => {
  loading.value = true;
  try {
    const res: any = await getPhysiology();
    records.value = Array.isArray(res?.data) ? res.data : [];
  } finally {
    loading.value = false;
  }
  await nextTick();
  scrollToEnd();
};

const scrollToEnd = () => {
  const el = scrollRef.value;
  if (!el) return;
  requestAnimationFrame(() => {
    el.scrollTo({ left: el.scrollWidth, behavior: "smooth" });
  });
};

const add = () => {
  const dialog = new CoverDialog({
    component: h(AddPhysiology, {
      onSuccess() {
        load();
        dialog.close();
      },
    }),
  });
  dialog.open();
};

const exportLoading = ref(false);
const exportData = () => {
  exportLoading.value = true;
  exportPhysiology()
    .then((res: { filename: string; blob: Blob }) => {
      const url = window.URL.createObjectURL(new Blob([res.blob]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", res.filename);
      link.click();
      window.URL.revokeObjectURL(url);
    })
    .finally(() => {
      exportLoading.value = false;
    });
};

const importLoading = ref(false);
const importData = () => {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.style.display = "none";
  input.onchange = (e: Event) => {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    importLoading.value = true;
    const formData = new FormData();
    formData.append("file", file);
    importPhysiology(formData)
      .then(() => load())
      .finally(() => {
        importLoading.value = false;
      });
  };
  input.click();
};

/** 窗口尺寸变化后可视区宽度也变了，重新夹一次 tip 位置 */
onMounted(() => {
  window.addEventListener("resize", syncTip);
  load();
});
onUnmounted(() => {
  window.removeEventListener("resize", syncTip);
});
</script>

<style scoped>
/* ── 指标卡 ── */
.stat-card {
  border-radius: 10px;
  border: 1px solid var(--glass-line);
  background: var(--glass-inset);
  padding: 10px 12px 11px;
}

.stat-label {
  font-size: 12px;
  letter-spacing: 0.14em;
  color: rgba(255, 255, 255, 0.42);
  text-transform: uppercase;
}

.stat-value {
  margin-top: 6px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 20px;
  font-weight: 600;
  line-height: 1.1;
  color: rgba(255, 255, 255, 0.94);
}

.stat-unit {
  margin-left: 3px;
  font-size: 12px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.45);
}

.stat-sub {
  margin-top: 5px;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.34);
}

/* ── 图例 ── */
.legend-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 2px;
}

.legend-band {
  display: inline-block;
  width: 14px;
  height: 8px;
  border-radius: 2px;
  background: rgba(142, 111, 247, 0.22);
  border: 1px dashed rgba(142, 111, 247, 0.55);
}

.legend-line {
  display: inline-block;
  width: 12px;
  height: 0;
  border-top: 1px dashed rgba(255, 255, 255, 0.5);
}

/* ── 图表横向滚动区 ── */
.chart-scroller {
  cursor: grab;
}

.chart-scroller.is-dragging {
  cursor: grabbing;
  user-select: none;
}

/* ── 图表文字：最小 12px ── */
/* 数字压在柱身内顶部：亮色（渐变/琥珀）柱身配深色字，约值柱（暗）配浅色字 */
.ct-val {
  font-size: 12px;
  fill: rgba(38, 22, 48, 0.92);
  font-weight: 700;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}

.ct-val--warn {
  fill: rgba(66, 36, 4, 0.95);
}

.ct-val--soft {
  fill: rgba(255, 255, 255, 0.86);
  paint-order: stroke;
  stroke: rgba(14, 10, 22, 0.55);
  stroke-width: 2.5px;
  stroke-linejoin: round;
}

.ct-x {
  font-size: 12px;
  fill: rgba(255, 255, 255, 0.38);
}

.ct-year {
  font-size: 12px;
  fill: rgba(255, 255, 255, 0.4);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}

/* 平均线标签会压在柱身/柱子上，加一圈底色描边保证可读 */
.ct-avg {
  font-size: 12px;
  fill: rgba(255, 255, 255, 0.72);
  paint-order: stroke;
  stroke: rgba(22, 17, 32, 0.82);
  stroke-width: 3.5px;
  stroke-linejoin: round;
}

.bar-rect {
  transition: opacity 0.2s ease;
}

/* ── 悬浮提示 ── */
.chart-tip {
  position: absolute;
  z-index: 5;
  padding: 7px 10px;
  border-radius: 8px;
  background: rgba(12, 10, 18, 0.94);
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.5);
  pointer-events: none;
  white-space: nowrap;
  transition: opacity 0.12s ease;
}

/* 指向柱子的小箭头 */
.chart-tip-arrow {
  position: absolute;
  bottom: -5px;
  width: 8px;
  height: 8px;
  margin-left: -4px;
  background: rgba(12, 10, 18, 0.94);
  border-right: 1px solid rgba(255, 255, 255, 0.14);
  border-bottom: 1px solid rgba(255, 255, 255, 0.14);
  transform: rotate(45deg);
}

/* 翻到柱顶下方时，箭头朝上 */
.chart-tip-arrow--below {
  bottom: auto;
  top: -5px;
  border-right: 0;
  border-bottom: 0;
  border-left: 1px solid rgba(255, 255, 255, 0.14);
  border-top: 1px solid rgba(255, 255, 255, 0.14);
}

/* ── 通用块容器 ── */
.panel-block {
  border-radius: 10px;
  border: 1px solid var(--glass-line);
  background: var(--glass-inset);
  padding: 10px 12px;
}

/* ── 多年总览：年份 × 月份日历表 ── */
.cal-wrap {
  border-radius: 10px;
  border: 1px solid var(--glass-line);
  background: var(--glass-inset);
  padding: 8px 10px 9px;
}

.cal-head,
.cal-row {
  display: grid;
  grid-template-columns: 44px repeat(12, minmax(0, 1fr)) 28px;
  gap: 3px;
}

.cal-head {
  margin-bottom: 4px;
}

.cal-corner,
.cal-month,
.cal-total-head {
  font-size: 12px;
  letter-spacing: 0.02em;
  color: rgba(255, 255, 255, 0.34);
  text-align: center;
}

.cal-corner {
  text-align: left;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}

.cal-body {
  max-height: 186px;
  overflow-y: auto;
  padding-right: 2px;
}

.cal-row + .cal-row {
  margin-top: 3px;
}

.cal-year {
  display: flex;
  align-items: center;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.5);
}

.cal-cell {
  min-height: 28px;
  display: flex;
  flex-wrap: wrap;
  align-content: center;
  justify-content: center;
  gap: 2px 4px;
  padding: 2px 1px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.03);
  transition: background-color 0.15s ease, box-shadow 0.15s ease;
}

.cal-cell--on {
  background: rgba(244, 114, 182, 0.14);
  box-shadow: inset 0 0 0 1px rgba(244, 114, 182, 0.24);
}

.cal-cell--on:hover {
  background: rgba(244, 114, 182, 0.26);
}

.cal-date {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  line-height: 1.1;
  color: rgba(255, 255, 255, 0.92);
}

/* 只记录到月份、没有「日」的记录 */
.cal-date--q {
  color: rgba(255, 255, 255, 0.45);
}

.cal-total {
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.45);
}

/* ── 状态标签 ── */
.tag {
  padding: 1px 7px;
  border-radius: 999px;
  white-space: nowrap;
}

.tag--ok {
  color: rgba(167, 243, 208, 0.9);
  background: rgba(52, 211, 153, 0.1);
}

.tag--warn {
  color: rgba(251, 191, 36, 0.95);
  background: rgba(251, 191, 36, 0.12);
}

.tag--muted {
  color: rgba(255, 255, 255, 0.5);
  background: rgba(255, 255, 255, 0.06);
}

.tag--live {
  color: rgba(196, 181, 253, 0.95);
  background: rgba(142, 111, 247, 0.16);
}
</style>
