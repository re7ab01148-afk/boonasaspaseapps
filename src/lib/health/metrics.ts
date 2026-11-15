export type MetricKey =
  | "hr"
  | "temp"
  | "spo2"
  | "sys"
  | "dia"
  | "glucose"
  | "sleep"
  | "mood"
  | "iop"
  | "hydration"
  | "radiation";

export type Status = "normal" | "watch" | "critical";
export type ChartToken = "chart-1" | "chart-2" | "chart-3" | "chart-4" | "chart-5" | "chart-6";

export interface MetricDef {
  key: MetricKey;
  label: string;
  short: string;
  unit: string;
  decimals: number;
  normal: [number, number];
  watch: [number, number];
  chart: ChartToken;
  axis: [number, number];
}

export const METRICS: Record<MetricKey, MetricDef> = {
  hr: { key: "hr", label: "Heart Rate", short: "HR", unit: "bpm", decimals: 0, normal: [55, 95], watch: [45, 110], chart: "chart-3", axis: [40, 130] },
  temp: { key: "temp", label: "Body Temperature", short: "Temp", unit: "°C", decimals: 1, normal: [36.1, 37.4], watch: [35.5, 38], chart: "chart-2", axis: [35, 39.5] },
  spo2: { key: "spo2", label: "Blood Oxygen", short: "SpO₂", unit: "%", decimals: 0, normal: [95, 100], watch: [92, 100], chart: "chart-5", axis: [88, 100] },
  sys: { key: "sys", label: "Systolic Pressure", short: "SYS", unit: "mmHg", decimals: 0, normal: [90, 129], watch: [85, 139], chart: "chart-1", axis: [80, 160] },
  dia: { key: "dia", label: "Diastolic Pressure", short: "DIA", unit: "mmHg", decimals: 0, normal: [60, 84], watch: [55, 89], chart: "chart-5", axis: [50, 100] },
  glucose: { key: "glucose", label: "Blood Sugar", short: "Glucose", unit: "mg/dL", decimals: 0, normal: [70, 140], watch: [60, 180], chart: "chart-4", axis: [50, 200] },
  sleep: { key: "sleep", label: "Sleep", short: "Sleep", unit: "h", decimals: 1, normal: [7, 10], watch: [6, 12], chart: "chart-6", axis: [3, 10] },
  mood: { key: "mood", label: "Mood", short: "Mood", unit: "/5", decimals: 1, normal: [3.8, 5], watch: [2.8, 5], chart: "chart-4", axis: [1, 5] },
  iop: { key: "iop", label: "Eye Pressure", short: "IOP", unit: "mmHg", decimals: 0, normal: [10, 21], watch: [8, 24], chart: "chart-1", axis: [6, 28] },
  hydration: { key: "hydration", label: "Hydration", short: "Water", unit: "L", decimals: 1, normal: [2, 4], watch: [1.5, 5], chart: "chart-5", axis: [0, 5] },
  radiation: { key: "radiation", label: "Radiation Dose", short: "Dose", unit: "mSv/day", decimals: 2, normal: [0, 1], watch: [0, 1.5], chart: "chart-6", axis: [0, 2] },
};

/** Classify a value against the metric's healthy and watch ranges. */
export function statusOf(metric: MetricKey, value: number): Status {
  const m = METRICS[metric];
  if (value >= m.normal[0] && value <= m.normal[1]) return "normal";
  if (value >= m.watch[0] && value <= m.watch[1]) return "watch";
  return "critical";
}

export function worstStatus(list: Status[]): Status {
  if (list.includes("critical")) return "critical";
  if (list.includes("watch")) return "watch";
  return "normal";
}

export function formatValue(metric: MetricKey, value: number) {
  return value.toFixed(METRICS[metric].decimals);
}

export const STATUS_LABEL: Record<Status, string> = { normal: "Normal", watch: "Watch", critical: "Critical" };

export const STATUS_STYLE: Record<Status, { pill: string; text: string; dot: string; soft: string; ring: string }> = {
  normal: { pill: "bg-success/10 text-success border-success/25", text: "text-success", dot: "bg-success", soft: "bg-success/10", ring: "stroke-success" },
  watch: { pill: "bg-warning/15 text-warning-foreground border-warning/40", text: "text-warning-foreground", dot: "bg-warning", soft: "bg-warning/15", ring: "stroke-warning" },
  critical: { pill: "bg-destructive/10 text-destructive border-destructive/25", text: "text-destructive", dot: "bg-destructive", soft: "bg-destructive/10", ring: "stroke-destructive" },
};

export const XP_PER_LEVEL = 1000;
export function levelFromXp(xp: number) {
  const into = xp % XP_PER_LEVEL;
  return { level: Math.floor(xp / XP_PER_LEVEL) + 1, into, pct: Math.round((into / XP_PER_LEVEL) * 100) };
}

const ADVICE: Record<MetricKey, [string, string]> = {
  hr: ["Rest for 5 minutes, breathe slowly and re-measure seated.", "Stop activity, lie down and contact the flight surgeon now."],
  temp: ["Hydrate, reduce workload and re-check in 1 hour.", "Possible infection. Isolate, take antipyretic per kit card A-3 and call the flight surgeon."],
  spo2: ["Check sensor placement and cabin O₂, then re-measure.", "Put on O₂ mask from the emergency kit and alert the crew."],
  sys: ["Limit salt and caffeine, re-measure after 10 min seated.", "Notify the flight surgeon; repeat measurement on both arms."],
  dia: ["Re-measure seated after 10 minutes.", "Notify the flight surgeon for medication review."],
  glucose: ["Have a balanced snack or adjust meal timing, re-test in 2 h.", "Follow glucose protocol G-1 and notify the flight surgeon."],
  sleep: ["Dim cabin light 1 h before rest and avoid screens.", "Request a schedule adjustment; fatigue raises operational risk."],
  mood: ["Schedule a private call with family or a hobby block today.", "Book a private conference with the behavioral health team."],
  iop: ["Avoid head-down positions; re-check with tonometer tomorrow.", "Possible SANS. Run OCT eye scan and notify the flight surgeon."],
  hydration: ["Drink 500 ml over the next hour.", "Start a structured hydration plan and log every intake."],
  radiation: ["Spend sleep period in the shielded crew quarters.", "Move to the storm shelter and follow the radiation protocol."],
};

/** Next-step advice for a reading's status. */
export function recommend(metric: MetricKey, status: Status) {
  if (status === "normal") return "Within the healthy range. Keep your routine and log again at the next check-in.";
  return status === "watch" ? ADVICE[metric][0] : ADVICE[metric][1];
}

function distanceFromNormal(metric: MetricKey, v: number) {
  const [lo, hi] = METRICS[metric].normal;
  return v < lo ? lo - v : v > hi ? v - hi : 0;
}
/** true = moved closer to the healthy range, false = further, null = no change in distance. */
export function improved(metric: MetricKey, now: number, prev: number): boolean | null {
  const a = distanceFromNormal(metric, prev);
  const b = distanceFromNormal(metric, now);
  return a === b ? null : b < a;
}

/** Readings the helmet can't take yet: they are logged by hand for now. */
export const MANUAL_METRICS: MetricKey[] = ["sys", "dia", "glucose"];
export const MANUAL_NOTE = "Manual now · Auto in next helmet version";
export const isManualMetric = (m: MetricKey) => MANUAL_METRICS.includes(m);
