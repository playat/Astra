<template>
  <div
    class="relative w-[86vw] max-w-[1040px] text-white max-h-[78vh] overflow-y-auto overflow-x-hidden scrollbar-none pr-1"
  >
    <!-- ── 顶部标题 ── -->
    <div class="flex items-end justify-between gap-4 px-1 pb-4">
      <div class="flex items-center gap-3">
        <div
          class="w-[3px] h-9 rounded-full bg-gradient-to-b from-pink-300 to-violet-500"
        ></div>
        <div>
          <div class="text-[10px] uppercase tracking-[0.35em] text-white/35">
            cycle log
          </div>
          <div class="text-base font-semibold tracking-wide">生理期记录</div>
        </div>
      </div>
      <div class="text-right font-mono text-[11px] leading-5 text-white/40">
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
        <div class="flex items-center justify-between px-1 pb-2">
          <div class="text-xs tracking-[0.2em] text-white/70">周期长度趋势</div>
          <div class="flex items-center gap-3 text-[10px] text-white/35">
            <span class="flex items-center gap-1.5">
              <i class="legend-dot bg-gradient-to-b from-pink-300 to-violet-500"></i>
              正常
            </span>
            <span class="flex items-center gap-1.5">
              <i class="legend-dot bg-amber-400/80"></i>
              偏离
            </span>
            <span class="flex items-center gap-1.5">
              <i class="legend-line"></i>
              平均
            </span>
          </div>
        </div>

        <div
          ref="scrollRef"
          class="overflow-x-auto overflow-y-hidden scrollbar-none"
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

              <!-- 正常区间底色 -->
              <rect
                x="0"
                :y="bandY"
                :width="chartWidth"
                :height="bandH"
                fill="rgba(142,111,247,0.09)"
              />
              <line
                x1="0"
                :x2="chartWidth"
                :y1="bandY"
                :y2="bandY"
                stroke="rgba(142,111,247,0.25)"
                stroke-dasharray="3 5"
              />
              <line
                x1="0"
                :x2="chartWidth"
                :y1="bandY + bandH"
                :y2="bandY + bandH"
                stroke="rgba(142,111,247,0.25)"
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
                  :y="yOf(c.days)"
                  :width="barW"
                  :height="Math.max(3, chartH - padB - yOf(c.days))"
                  rx="4"
                  :fill="
                    isAbnormal(c.days)
                      ? 'rgba(251,191,36,0.8)'
                      : 'url(#phyBar)'
                  "
                  :opacity="hoverIndex === -1 || hoverIndex === i ? 1 : 0.35"
                  class="bar-rect"
                />
                <text
                  :x="barX(i) + barW / 2"
                  :y="yOf(c.days) - 6"
                  text-anchor="middle"
                  class="ct-val"
                  :class="{ 'ct-val--warn': isAbnormal(c.days) }"
                >
                  {{ c.days }}
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

            <!-- 悬浮提示 -->
            <div
              v-if="hoverCycle"
              class="chart-tip"
              :style="{ left: tipLeft + 'px', top: tipTop + 'px' }"
            >
              <div class="font-mono text-[10px] text-white/80">
                {{ hoverCycle.start }} → {{ hoverCycle.end }}
              </div>
              <div class="mt-0.5 text-[10px]">
                <span
                  class="font-semibold"
                  :class="
                    isAbnormal(hoverCycle.days)
                      ? 'text-amber-300'
                      : 'text-violet-300'
                  "
                  >{{ hoverCycle.days }} 天</span
                >
                <span class="text-white/45 ml-2">{{ statusText(hoverCycle.days) }}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- ── 多年总览 + 最近记录 ── -->
      <div class="mt-4 flex flex-col gap-3 md:flex-row">
        <!-- 多年总览 -->
        <section class="min-w-0 flex-1">
          <div class="flex items-center justify-between px-1 pb-2">
            <div class="text-xs tracking-[0.2em] text-white/70">多年总览</div>
            <div class="text-[10px] text-white/30">每格为当月起经日</div>
          </div>

          <div class="heat-wrap">
            <div class="heat-head">
              <div></div>
              <div v-for="m in 12" :key="'hm-' + m" class="heat-month">
                {{ m }}
              </div>
            </div>

            <div class="heat-body">
              <div v-for="row in yearMatrix" :key="row.year" class="heat-row">
                <div class="heat-year">{{ row.year }}</div>
                <div
                  v-for="(cell, m) in row.months"
                  :key="row.year + '-' + m"
                  class="heat-cell"
                  :class="{ 'heat-cell--on': cell.count > 0 }"
                  :style="
                    cell.count > 0
                      ? { backgroundColor: heatColor(cell.count) }
                      : undefined
                  "
                  :title="
                    cell.count > 0
                      ? `${row.year}-${pad(m + 1)}：${cell.days.join('、')} 日`
                      : `${row.year}-${pad(m + 1)}：无记录`
                  "
                >
                  <span v-if="cell.count" class="heat-day">{{
                    cell.days.slice(0, 2).join("·")
                  }}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- 最近记录 -->
        <section v-if="recent.length" class="w-full md:w-[300px] md:shrink-0">
          <div class="px-1 pb-2 text-xs tracking-[0.2em] text-white/70">
            最近记录
          </div>
          <div class="heat-wrap">
            <div
              v-for="(r, i) in recent"
              :key="'rc-' + i"
              class="flex items-center gap-2 border-b border-white/[0.06] py-1.5 text-[11px] last:border-b-0"
            >
              <span class="w-[74px] font-mono text-white/75">{{ r.start }}</span>
              <span
                class="font-mono"
                :class="
                  r.days && isAbnormal(r.days)
                    ? 'text-amber-300'
                    : 'text-white/45'
                "
                >{{ r.days ? r.days + "d" : "—" }}</span
              >
              <span class="ml-auto text-[10px]" :class="r.tagClass">{{
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
import { computed, h, nextTick, onMounted, ref } from "vue";
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
  start: string;
  end: string;
  days: number;
}

const DAY_MS = 86400000;
const NORMAL_MIN = 21;
const NORMAL_MAX = 35;

/* ── 布局常量 ── */
const barStep = 34;
const barW = 20;
const chartH = 200;
const padT = 22;
const padB = 30;

const records = ref<PhyRecord[]>([]);
const loading = ref(false);
const hoverIndex = ref(-1);
const scrollRef = ref<HTMLElement>();

const parseDate = (s: string) => {
  const [y, m, d] = String(s).split(/[-/.]/).map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
};
const fmt = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;
const pad = (n: number) => String(n).padStart(2, "0");

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
    const s = parseDate(list[i].happen);
    const e = parseDate(list[i + 1].happen);
    out.push({
      start: fmt(s),
      end: fmt(e),
      days: Math.round((e.getTime() - s.getTime()) / DAY_MS),
    });
  }
  return out;
});

const lastRecord = computed(() => sorted.value[sorted.value.length - 1]);
const sinceLast = computed(() => {
  if (!lastRecord.value) return null;
  return Math.floor((Date.now() - parseDate(lastRecord.value.happen).getTime()) / DAY_MS);
});

const avgDays = computed(() => {
  if (!cycles.value.length) return 0;
  return cycles.value.reduce((a, c) => a + c.days, 0) / cycles.value.length;
});
const avgLabel = computed(() => `${avgDays.value.toFixed(1)} 天`);
const minDays = computed(() =>
  cycles.value.length ? Math.min(...cycles.value.map((c) => c.days)) : 0
);
const maxDays = computed(() =>
  cycles.value.length ? Math.max(...cycles.value.map((c) => c.days)) : 0
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
  return [
    {
      label: "最近一次",
      value: last ? last.happen.slice(5) : "--",
      unit: "",
      sub: last ? `${last.happen.slice(0, 4)} 年` : "暂无记录",
    },
    {
      label: since !== null && since <= 90 ? "本次周期" : "距上次",
      value: since === null ? "--" : String(since + (since <= 90 ? 1 : 0)),
      unit: "天",
      sub:
        since === null
          ? "暂无记录"
          : since <= 90
          ? "从最近一次开始算起"
          : "上次记录距今",
    },
    {
      label: "平均周期",
      value: cycles.value.length ? avgDays.value.toFixed(1) : "--",
      unit: "天",
      sub: `共 ${cycles.value.length} 个完整周期`,
    },
    {
      label: "波动范围",
      value: cycles.value.length ? `${minDays.value}–${maxDays.value}` : "--",
      unit: "天",
      sub: `正常 ${NORMAL_MIN}–${NORMAL_MAX} 天`,
    },
  ];
});

/* ── 图表刻度 ── */
const yMax = computed(() => Math.max(40, maxDays.value + 6));
const plotH = computed(() => chartH - padT - padB);
const yOf = (v: number) => padT + (1 - v / yMax.value) * plotH.value;
const chartWidth = computed(() =>
  Math.max(560, cycles.value.length * barStep + 16)
);
const barX = (i: number) => 8 + i * barStep + (barStep - barW) / 2;

const bandY = computed(() => yOf(NORMAL_MAX));
const bandH = computed(() => Math.max(0, yOf(NORMAL_MIN) - yOf(NORMAL_MAX)));
const avgY = computed(() => yOf(avgDays.value));

const isAbnormal = (d: number) => d < NORMAL_MIN || d > NORMAL_MAX;
const statusText = (d: number) =>
  d < NORMAL_MIN ? "偏短" : d > NORMAL_MAX ? "偏长" : "正常范围";

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
const tipLeft = computed(() =>
  hoverCycle.value ? barX(hoverIndex.value) + barW / 2 : 0
);
const tipTop = computed(() =>
  hoverCycle.value ? Math.max(28, yOf(hoverCycle.value.days) - 14) : 0
);

/* ── 多年总览矩阵 ── */
const yearMatrix = computed(() => {
  const map = new Map<number, { count: number; days: number[] }[]>();
  for (const r of sorted.value) {
    const d = parseDate(r.happen);
    const y = d.getFullYear();
    if (!map.has(y)) {
      map.set(
        y,
        Array.from({ length: 12 }, () => ({ count: 0, days: [] as number[] }))
      );
    }
    const cell = map.get(y)![d.getMonth()];
    cell.count += 1;
    cell.days.push(d.getDate());
  }
  return [...map.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([year, months]) => ({
      year,
      months: months.map((m) => ({ count: m.count, days: [...m.days].sort((x, y) => x - y) })),
    }));
});

const heatColor = (n: number) => {
  const alpha = Math.min(0.72, 0.3 + (n - 1) * 0.2);
  return `rgba(244, 114, 182, ${alpha})`;
};

/* ── 最近记录 ── */
const recent = computed(() => {
  const rows = cycles.value
    .slice(-6)
    .reverse()
    .map((c) => ({
      start: c.start,
      end: c.end,
      days: c.days,
      tag: statusText(c.days),
      tagClass: isAbnormal(c.days) ? "tag tag--warn" : "tag tag--ok",
    }));

  const last = lastRecord.value;
  if (last) {
    rows.unshift({
      start: fmt(parseDate(last.happen)),
      end: "至今",
      days: 0,
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

onMounted(load);
</script>

<style scoped>
/* ── 指标卡 ── */
.stat-card {
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  padding: 10px 12px 11px;
}

.stat-label {
  font-size: 10px;
  letter-spacing: 0.2em;
  color: rgba(255, 255, 255, 0.35);
  text-transform: uppercase;
}

.stat-value {
  margin-top: 6px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 19px;
  font-weight: 600;
  line-height: 1.1;
  color: rgba(255, 255, 255, 0.94);
}

.stat-unit {
  margin-left: 3px;
  font-size: 10px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.4);
}

.stat-sub {
  margin-top: 5px;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.28);
}

/* ── 图例 ── */
.legend-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 2px;
}

.legend-line {
  display: inline-block;
  width: 12px;
  height: 0;
  border-top: 1px dashed rgba(255, 255, 255, 0.5);
}

/* ── 图表文字 ── */
.ct-val {
  font-size: 9px;
  fill: rgba(255, 255, 255, 0.5);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}

.ct-val--warn {
  fill: rgba(251, 191, 36, 0.9);
}

.ct-x {
  font-size: 9px;
  fill: rgba(255, 255, 255, 0.3);
}

.ct-year {
  font-size: 9px;
  fill: rgba(255, 255, 255, 0.32);
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
}

.ct-avg {
  font-size: 9px;
  fill: rgba(255, 255, 255, 0.45);
}

.bar-rect {
  transition: opacity 0.2s ease;
}

.chart-tip {
  position: absolute;
  z-index: 5;
  transform: translate(-50%, -100%);
  padding: 6px 9px;
  border-radius: 8px;
  background: rgba(12, 10, 18, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.12);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.45);
  pointer-events: none;
  white-space: nowrap;
}

/* ── 多年总览 ── */
.heat-wrap {
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  padding: 10px 12px;
}

.heat-head,
.heat-row {
  display: grid;
  grid-template-columns: 42px repeat(12, minmax(0, 1fr));
  gap: 4px;
  align-items: center;
}

.heat-head {
  margin-bottom: 5px;
}

.heat-body {
  max-height: 168px;
  overflow-y: auto;
  padding-right: 2px;
}

.heat-month {
  text-align: center;
  font-size: 9px;
  color: rgba(255, 255, 255, 0.25);
}

.heat-row + .heat-row {
  margin-top: 4px;
}

.heat-year {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 10px;
  color: rgba(255, 255, 255, 0.4);
}

.heat-cell {
  height: 20px;
  border-radius: 3px;
  background: rgba(255, 255, 255, 0.04);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease, background-color 0.15s ease;
}

.heat-day {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 9px;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1;
}

.heat-cell--on {
  box-shadow: 0 0 10px rgba(244, 114, 182, 0.25);
}

.heat-cell:hover {
  transform: scale(1.1);
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

.tag--live {
  color: rgba(196, 181, 253, 0.95);
  background: rgba(142, 111, 247, 0.16);
}
</style>
