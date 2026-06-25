import { defineStore } from "pinia";
import { ref, computed } from "vue";

interface DayRecord {
  date: string;
  amount: number;
}

const STORAGE_KEY = "salary_records";

const loadRecords = (): DayRecord[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const saveRecords = (records: DayRecord[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
};

const toDateKey = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

const useSalaryStore = defineStore("salary", () => {
  const records = ref<DayRecord[]>(loadRecords());

  let dirty = false;
  let saveTimer: ReturnType<typeof setTimeout> | null = null;

  const flush = () => {
    if (!dirty) return;
    dirty = false;
    saveRecords(records.value);
  };

  const scheduleSave = () => {
    dirty = true;
    if (saveTimer) return;
    saveTimer = setTimeout(() => {
      saveTimer = null;
      flush();
    }, 60000);
  };

  const totalEarned = computed(() =>
    records.value.reduce((sum, r) => sum + r.amount, 0)
  );

  const todayKey = computed(() => toDateKey(new Date()));

  const todayEarned = computed(() => {
    const rec = records.value.find((r) => r.date === todayKey.value);
    return rec ? rec.amount : 0;
  });

  const recordSalary = (amount: number) => {
    const key = todayKey.value;
    const idx = records.value.findIndex((r) => r.date === key);
    if (idx >= 0) {
      records.value[idx].amount = amount;
    } else {
      records.value.push({ date: key, amount });
    }
    scheduleSave();
  };

  return {
    records,
    totalEarned,
    todayEarned,
    recordSalary,
    flush,
  };
});

export default useSalaryStore;
