<template>
  <div
    ref="elRef"
    class="fixed z-[9999] select-none cursor-move text-white/90"
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
      class="fixed pointer-events-none z-[10000]"
      :style="{
        left: `${coin.x}px`,
        top: `${coin.y}px`,
      }"
    >
      <div
        class="coin w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold shadow-lg"
        :class="coin.phase"
      >
        ¥
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, onUnmounted } from "vue";
import { getSalaryConfig } from "@/api/salary.js";
import { isWorkday, fetchHolidayData } from "@/utils/holiday.js";
import useSalaryStore from "@/store/salary.js";

interface SalaryConfig {
  monthlySalary: number;
  workHoursPerDay: number;
  workStartHour: number;
  workStartMinute: number;
}

interface Coin {
  id: number;
  x: number;
  y: number;
  phase: "fall" | "bounce" | "done";
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
const pos = ref({ x: window.innerWidth - 120, y: 8 });
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
let workDaysCache: { key: string; count: number } | null = null;

const getWorkDaysInMonth = (year: number, month: number): number => {
  const key = `${year}-${month}`;
  if (workDaysCache?.key === key) return workDaysCache.count;

  let count = 0;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    if (isWorkday(new Date(year, month, d))) count++;
  }
  workDaysCache = { key, count };
  return count;
};

interface TickResult {
  salary: number;
  working: boolean;
}

const calcTick = (now: Date): TickResult => {
  if (!config) return { salary: 0, working: false };
  if (!isWorkday(now)) return { salary: 0, working: false };

  const workStartSec = config.workStartHour * 3600 + config.workStartMinute * 60;
  const workEndSec = workStartSec + config.workHoursPerDay * 3600;
  const nowSec = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();

  if (nowSec < workStartSec || nowSec >= workEndSec) return { salary: 0, working: false };

  const elapsedSec = nowSec - workStartSec;
  const workDaysThisMonth = getWorkDaysInMonth(now.getFullYear(), now.getMonth());
  const salaryPerSec = config.monthlySalary / (workDaysThisMonth * config.workHoursPerDay * 3600);

  return { salary: salaryPerSec * elapsedSec, working: true };
};

const spawnCoin = () => {
  if (!elRef.value) return;
  const rect = elRef.value.getBoundingClientRect();
  const id = ++coinId;
  const coin: Coin = {
    id,
    x: rect.left + rect.width / 2 - 10,
    y: -20,
    phase: "fall",
  };
  coins.push(coin);

  requestAnimationFrame(() => {
    coin.y = rect.top + rect.height / 2 - 10;
  });

  setTimeout(() => {
    coin.phase = "bounce";
  }, 500);

  setTimeout(() => {
    const idx = coins.findIndex((c) => c.id === id);
    if (idx !== -1) coins.splice(idx, 1);
  }, 1200);
};

const tick = (timestamp: number) => {
  if (timestamp - lastTick >= 10000) {
    lastTick = timestamp;
    const { salary, working } = calcTick(new Date());
    isWorking.value = working;
    todayDisplay.value = `¥${salary.toFixed(2)}`;

    if (working) {
      salaryStore.recordSalary(salary);
      spawnCoin();
    }
  }
  rafId = requestAnimationFrame(tick);
};

const startLoop = () => {
  lastTick = 0;
  rafId = requestAnimationFrame(tick);
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
  if (rafId) cancelAnimationFrame(rafId);
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

.coin {
  background: linear-gradient(135deg, #ffd700, #ffaa00, #ff8800);
  color: #8b4513;
  border: 2px solid #cc8800;
  box-shadow:
    0 2px 6px rgba(0, 0, 0, 0.3),
    inset 0 1px 2px rgba(255, 255, 255, 0.4);
  animation-fill-mode: forwards;
}

.coin.fall {
  animation: coinDrop 0.5s cubic-bezier(0.25, 0.1, 0.25, 1) forwards;
}

.coin.bounce {
  animation: coinBounce 0.7s ease-out forwards;
}

@keyframes coinDrop {
  0% {
    transform: translateY(-30px) rotate(0deg);
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  100% {
    transform: translateY(0) rotate(360deg);
    opacity: 1;
  }
}

@keyframes coinBounce {
  0% {
    transform: scale(1.2) rotate(360deg);
    opacity: 1;
  }
  30% {
    transform: scale(0.9) rotate(400deg);
    opacity: 1;
  }
  60% {
    transform: scale(1.05) rotate(420deg);
    opacity: 0.8;
  }
  100% {
    transform: scale(0.5) rotate(450deg);
    opacity: 0;
  }
}
</style>
