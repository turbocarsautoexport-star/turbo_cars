export type StatsPeriod = "7d" | "30d" | "6m" | "1y";

export interface SeriesPoint {
  label: string;
  value: number;
}

export const PERIOD_LABELS: Record<StatsPeriod, string> = {
  "7d": "Oxirgi hafta",
  "30d": "Oxirgi oy",
  "6m": "Oxirgi 6 oy",
  "1y": "Oxirgi yil",
};

const WEEKDAYS_UZ = ["Ya", "Du", "Se", "Ch", "Pa", "Ju", "Sh"];
const MONTHS_UZ = [
  "Yan",
  "Fev",
  "Mar",
  "Apr",
  "May",
  "Iyun",
  "Iyul",
  "Avg",
  "Sen",
  "Okt",
  "Noy",
  "Dek",
];

function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function periodConfig(period: StatsPeriod): { points: number; unit: "day" | "month" } {
  switch (period) {
    case "7d":
      return { points: 7, unit: "day" };
    case "30d":
      return { points: 30, unit: "day" };
    case "6m":
      return { points: 6, unit: "month" };
    case "1y":
      return { points: 12, unit: "month" };
  }
}

export function buildStatsSeries(
  period: StatsPeriod,
  now: number
): { sales: SeriesPoint[]; counts: SeriesPoint[] } {
  const { points, unit } = periodConfig(period);
  // stable within the hour so the chart doesn't jitter on every re-render
  const rand = mulberry32(Math.floor(now / 3_600_000) + period.length * 97);

  const sales: SeriesPoint[] = [];
  const counts: SeriesPoint[] = [];

  for (let i = points - 1; i >= 0; i--) {
    const d = new Date(now);
    let label: string;

    if (unit === "day") {
      d.setDate(d.getDate() - i);
      label = period === "7d" ? WEEKDAYS_UZ[d.getDay()] : `${d.getDate()}.${d.getMonth() + 1}`;
    } else {
      d.setMonth(d.getMonth() - i);
      label = MONTHS_UZ[d.getMonth()];
    }

    const progress = (points - i) / points;
    const trend = 1 + progress * 0.6;
    const noise = 0.72 + rand() * 0.56;
    const weekendDip = unit === "day" && (d.getDay() === 0 || d.getDay() === 6) ? 0.7 : 1;
    const monthlyScale = unit === "month" ? 24 : 1;

    const count = Math.max(1, Math.round(3.4 * trend * noise * weekendDip * monthlyScale));
    const avgPrice = 190_000_000 + rand() * 95_000_000;

    counts.push({ label, value: count });
    sales.push({ label, value: Math.round(count * avgPrice) });
  }

  return { sales, counts };
}
