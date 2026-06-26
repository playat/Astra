<template>
  <div>
    <div
      ref="elRef"
      class="fixed select-none cursor-move text-white/90"
      :style="{ left: pos.x + 'px', top: pos.y + 'px' }"
      @mousedown="onDragStart"
      @touchstart.passive="onDragStart"
    >
      <div
        class="px-3 py-1.5 rounded-full backdrop-blur-sm text-sm font-mono whitespace-nowrap flex items-center gap-2 shadow-lg"
        :class="isWorking ? 'bg-green-600/80' : 'bg-gray-600/80'"
      >
        <span class="text-[10px] opacity-60">今日</span>
        <span
          v-for="(ch, i) in todayChars"
          :key="'t' + i"
          class="digit-slot"
          :class="{ 'digit-slot--symbol': !ch.isDigit }"
        >
          <span
            v-if="ch.isDigit"
            class="digit-strip"
            :style="{ transform: `translateY(-${ch.value * 1.2}em)` }"
          >
            <span v-for="n in 10" :key="n" class="digit-row">{{ n - 1 }}</span>
          </span>
          <span v-else class="digit-static">{{ ch.char }}</span>
        </span>
        <span class="text-[10px] opacity-60 mx-1">|</span>
        <span class="text-[10px] opacity-60">累计</span>
        <span
          v-for="(ch, i) in totalChars"
          :key="'p' + i"
          class="digit-slot"
          :class="{ 'digit-slot--symbol': !ch.isDigit }"
        >
          <span
            v-if="ch.isDigit"
            class="digit-strip"
            :style="{ transform: `translateY(-${ch.value * 1.2}em)` }"
          >
            <span v-for="n in 10" :key="n" class="digit-row">{{ n - 1 }}</span>
          </span>
          <span v-else class="digit-static">{{ ch.char }}</span>
        </span>
      </div>
    </div>
    <Teleport to="body">
      <div
        v-for="coin in coins"
        :key="coin.id"
        ref="coinEls"
        class="coin fixed pointer-events-none z-[10000] w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold"
        :style="{ left: `${coin.x}px`, top: `${coin.y}px` }"
      >
        ¥
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from "vue";
import { gsap } from "gsap";
import { getSalaryConfig } from "@/api/salary.js";
import { isWorkday, fetchHolidayData } from "@/utils/holiday.js";
import useSalaryStore from "@/store/salary.js";

interface SalaryConfig {
  monthlySalary: number;
  workHoursPerDay: number;
  workStartHour: number;
  workStartMinute: number;
  lunchStartHour: number;
  lunchStartMinute: number;
  lunchEndHour: number;
  lunchEndMinute: number;
}

interface Coin {
  id: number;
  x: number;
  y: number;
}

interface DigitChar {
  char: string;
  isDigit: boolean;
  value: number;
}

const toDigitChars = (s: string): DigitChar[] =>
  [...s].map((ch) => ({
    char: ch,
    isDigit: ch >= "0" && ch <= "9",
    value: ch >= "0" && ch <= "9" ? parseInt(ch) : 0,
  }));

const elRef = ref<HTMLElement>();
const coinEls = ref<HTMLElement[]>([]);
const pos = ref({ x: 50, y: 100 });
const todayDisplay = ref("¥0.00");
const isWorking = ref(false);
const coins = reactive<Coin[]>([]);

const salaryStore = useSalaryStore();
const totalDisplay = computed(() => `¥${salaryStore.totalEarned.toFixed(2)}`);

const todayChars = computed(() => toDigitChars(todayDisplay.value));
const totalChars = computed(() => toDigitChars(totalDisplay.value));

let config: SalaryConfig | null = null;
let rafId = 0;
let lastTick = 0;
let coinId = 0;
let activeTimelines: gsap.core.Timeline[] = [];

let cachedMonth = -1;
let cachedWorkDays = 0;
let cachedSalaryPerSec = 0;

const getWorkDaysInMonth = (year: number, month: number): number => {
  if (month === cachedMonth) return cachedWorkDays;

  let count = 0;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    if (isWorkday(new Date(year, month, d))) count++;
  }
  cachedMonth = month;
  cachedWorkDays = count;
  return count;
};

const getSalaryPerSec = (now: Date): number => {
  if (!config) return 0;
  const month = now.getMonth();
  if (month === cachedMonth && cachedSalaryPerSec > 0) return cachedSalaryPerSec;

  const workDays = getWorkDaysInMonth(now.getFullYear(), month);
  cachedSalaryPerSec = config.monthlySalary / (workDays * config.workHoursPerDay * 3600);
  return cachedSalaryPerSec;
};

interface TickResult {
  salary: number;
  working: boolean;
}

const calcTick = (now: Date): TickResult => {
  if (!config) return { salary: 0, working: false };
  if (!isWorkday(now)) return { salary: 0, working: false };

  const workStartSec = config.workStartHour * 3600 + config.workStartMinute * 60;
  const lunchStartSec = config.lunchStartHour * 3600 + config.lunchStartMinute * 60;
  const lunchEndSec = config.lunchEndHour * 3600 + config.lunchEndMinute * 60;
  const lunchDuration = lunchEndSec - lunchStartSec;
  const workEndSec = workStartSec + config.workHoursPerDay * 3600 + lunchDuration;
  const nowSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

  const salaryPerSec = getSalaryPerSec(now);
  const fullDaySalary = salaryPerSec * config.workHoursPerDay * 3600;

  if (nowSec < workStartSec) return { salary: 0, working: false };

  if (nowSec >= workEndSec) {
    return { salary: fullDaySalary, working: false };
  }

  let elapsedSec = nowSec - workStartSec;
  let working = true;

  if (nowSec >= lunchEndSec) {
    elapsedSec -= lunchDuration;
  } else if (nowSec >= lunchStartSec) {
    elapsedSec = lunchStartSec - workStartSec;
    working = false;
  }

  return { salary: salaryPerSec * elapsedSec, working };
};

const killTimelines = () => {
  activeTimelines.forEach((tl) => tl.kill());
  activeTimelines = [];
};

const spawnCoins = (count = 3) => {
  if (!elRef.value) return;
  const rect = elRef.value.getBoundingClientRect();

  for (let i = 0; i < count; i++) {
    const id = ++coinId;
    const coinX = rect.left + Math.random() * rect.width - 10;
    const targetY = rect.top + rect.height / 2 - 10;
    const driftDir = Math.random() > 0.5 ? 1 : -1;
    const maxDrift = driftDir > 0
      ? rect.right - coinX - 10
      : coinX - rect.left - 10;
    const drift = driftDir * (Math.random() * Math.max(0, maxDrift));

    const coin: Coin = { id, x: coinX, y: -20 };
    coins.push(coin);

    nextTick(() => {
      const idx = coins.findIndex((c) => c.id === id);
      const el = coinEls.value[idx];
      if (!el) return;

      const tl = gsap.timeline({
        onComplete: () => {
          const i = coins.findIndex((c) => c.id === id);
          if (i !== -1) coins.splice(i, 1);
        },
      });
      activeTimelines.push(tl);

      tl.to(el, {
        y: targetY,
        rotateY: 720,
        duration: 0.6,
        ease: "bounce.out",
        delay: i * 0.1,
      });

      tl.to(el, {
        x: `+=${drift}`,
        rotateY: 920,
        opacity: 0,
        duration: 0.8,
        ease: "power2.in",
      }, "-=0.3");
    });
  }
};

const tick = (timestamp: number) => {
  if (timestamp - lastTick >= 10000) {
    lastTick = timestamp;
    const { salary, working } = calcTick(new Date());
    isWorking.value = working;
    todayDisplay.value = `¥${salary.toFixed(2)}`;

    if (working) {
      salaryStore.recordSalary(salary);
      spawnCoins(5);
    }
  }
  rafId = requestAnimationFrame(tick);
};

const startLoop = () => {
  lastTick = 0;
  rafId = requestAnimationFrame(tick);
};

const stopLoop = () => {
  if (rafId) {
    cancelAnimationFrame(rafId);
    rafId = 0;
  }
};

const onDragStart = (e: MouseEvent | TouchEvent) => {
  if (!elRef.value) return;
  const rect = elRef.value.getBoundingClientRect();
  const clientX = e instanceof MouseEvent ? e.clientX : e.touches[0].clientX;
  const clientY = e instanceof MouseEvent ? e.clientY : e.touches[0].clientY;
  const offsetX = clientX - rect.left;
  const offsetY = clientY - rect.top;

  const onMove = (ev: MouseEvent | TouchEvent) => {
    const cx = ev instanceof MouseEvent ? ev.clientX : ev.touches[0].clientX;
    const cy = ev instanceof MouseEvent ? ev.clientY : ev.touches[0].clientY;
    pos.value = {
      x: Math.max(0, Math.min(window.innerWidth - rect.width, cx - offsetX)),
      y: Math.max(0, Math.min(window.innerHeight - rect.height, cy - offsetY)),
    };
  };

  const onUp = () => {
    window.removeEventListener("mousemove", onMove);
    window.removeEventListener("touchmove", onMove);
    window.removeEventListener("mouseup", onUp);
    window.removeEventListener("touchend", onUp);
  };

  window.addEventListener("mousemove", onMove);
  window.addEventListener("touchmove", onMove);
  window.addEventListener("mouseup", onUp);
  window.addEventListener("touchend", onUp);
};

const onBeforeUnload = () => {
  salaryStore.flush();
};

const onVisibilityChange = () => {
  if (document.hidden) {
    salaryStore.flush();
  } else {
    const { salary, working } = calcTick(new Date());
    isWorking.value = working;
    todayDisplay.value = `¥${salary.toFixed(2)}`;
  }
};

onMounted(async () => {
  const [configRes] = await Promise.all([getSalaryConfig(), fetchHolidayData()]);
  if (configRes.code === 200) config = configRes.data;

  const now = new Date();
  if (isWorkday(now)) {
    const { salary } = calcTick(now);
    todayDisplay.value = `¥${salary.toFixed(2)}`;
    salaryStore.recordSalary(salary);
    startLoop();
  } else {
    todayDisplay.value = "¥0.00";
  }

  window.addEventListener("beforeunload", onBeforeUnload);
  document.addEventListener("visibilitychange", onVisibilityChange);
});

onUnmounted(() => {
  stopLoop();
  killTimelines();
  window.removeEventListener("beforeunload", onBeforeUnload);
  document.removeEventListener("visibilitychange", onVisibilityChange);
});
</script>

<style scoped>
.digit-slot {
  display: inline-block;
  height: 1.2em;
  overflow: hidden;
  vertical-align: bottom;
}

.digit-slot--symbol {
  height: 1.2em;
}

.digit-strip {
  display: flex;
  flex-direction: column;
  transition: transform 0.6s cubic-bezier(0.22, 1, 0.36, 1);
}

.digit-row {
  display: block;
  height: 1.2em;
  line-height: 1.2em;
  text-align: center;
}

.digit-static {
  display: inline-block;
  height: 1.2em;
  line-height: 1.2em;
}
</style>

<style>
.coin {
  background: linear-gradient(135deg, #ffd700, #ffaa00, #ff8800);
  color: #8b4513;
  border: 2px solid #cc8800;
  box-shadow:
    0 2px 6px rgba(0, 0, 0, 0.3),
    inset 0 1px 2px rgba(255, 255, 255, 0.4);
}
</style>
