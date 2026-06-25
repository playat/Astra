interface ChineseDaysData {
  holidays: Record<string, string>;
  workdays: Record<string, string>;
  inLieuDays: Record<string, string>;
}

const holidaySet = new Set<string>();
const makeupSet = new Set<string>();

const applyData = (data: ChineseDaysData) => {
  Object.keys(data.holidays).forEach((d) => holidaySet.add(d));
  Object.keys(data.inLieuDays).forEach((d) => holidaySet.add(d));
  Object.keys(data.workdays).forEach((d) => makeupSet.add(d));
};

export const loadHolidayData = (data: ChineseDaysData) => {
  applyData(data);
};

const toDateKey = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export const isWorkday = (date: Date): boolean => {
  const key = toDateKey(date);
  if (makeupSet.has(key)) return true;
  if (holidaySet.has(key)) return false;
  const day = date.getDay();
  return day >= 1 && day <= 5;
};

const CDN_URL = "https://cdn.jsdelivr.net/npm/chinese-days/dist/chinese-days.json";

export const fetchHolidayData = async (): Promise<ChineseDaysData | null> => {
  try {
    const res = await fetch(CDN_URL);
    if (!res.ok) return null;
    const data: ChineseDaysData = await res.json();
    applyData(data);
    return data;
  } catch {
    return null;
  }
};
