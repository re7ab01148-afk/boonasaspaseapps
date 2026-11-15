import { statusOf, worstStatus, type ChartToken, type MetricKey, type Status } from "./metrics";

/** Fixed "now" for the simulated mission: 15 Nov 2026, 14:30 mission time (UTC). */
export const NOW = Date.UTC(2026, 10, 15, 14, 30);
const DAY = 86_400_000;

function rng(seed: number) {
  let t = seed;
  return () => {
    t |= 0;
    t = (t + 1831565813) | 0;
    let e = Math.imul(t ^ (t >>> 15), 1 | t);
    e = (e + Math.imul(e ^ (e >>> 7), 61 | e)) ^ e;
    return ((e ^ (e >>> 14)) >>> 0) / 4294967296;
  };
}
function gauss(r: () => number) {
  let a = 0;
  let b = 0;
  while (a === 0) a = r();
  while (b === 0) b = r();
  return Math.sqrt(-2 * Math.log(a)) * Math.cos(2 * Math.PI * b);
}
const round = (v: number, d = 0) => {
  const p = 10 ** d;
  return Math.round(v * p) / p;
};
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export type EnvId = "iss" | "gateway" | "moon" | "mars" | "rover";
export interface Environment {
  id: EnvId;
  name: string;
  short: string;
  location: string;
  gravity: string;
  radiation: number;
  commDelay: string;
  cabin: { co2: number; o2: number; pressure: number; temp: number; humidity: number };
}

export const ENVIRONMENTS: Record<EnvId, Environment> = {
  iss: {
    id: "iss",
    name: "International Space Station",
    short: "ISS",
    location: "Low Earth Orbit · 408 km",
    gravity: "Microgravity",
    radiation: 0.5,
    commDelay: "< 1 s",
    cabin: { co2: 2.6, o2: 21.1, pressure: 101.3, temp: 22.4, humidity: 46 },
  },
  gateway: {
    id: "gateway",
    name: "Lunar Gateway",
    short: "Gateway",
    location: "Near-rectilinear halo orbit",
    gravity: "Microgravity",
    radiation: 1.1,
    commDelay: "1.3 s",
    cabin: { co2: 3.1, o2: 20.8, pressure: 101, temp: 21.8, humidity: 41 },
  },
  moon: {
    id: "moon",
    name: "Artemis Base Camp",
    short: "Moon Base",
    location: "Shackleton Crater rim",
    gravity: "0.16 g",
    radiation: 1.3,
    commDelay: "1.3 s",
    cabin: { co2: 2.9, o2: 21.4, pressure: 70.3, temp: 23, humidity: 38 },
  },
  mars: {
    id: "mars",
    name: "Jezero Habitat",
    short: "Mars Hab",
    location: "Jezero Crater, Mars",
    gravity: "0.38 g",
    radiation: 0.7,
    commDelay: "12.4 min",
    cabin: { co2: 3.4, o2: 21, pressure: 70.3, temp: 21.2, humidity: 35 },
  },
  rover: {
    id: "rover",
    name: "Pressurized Rover PR-2",
    short: "Rover",
    location: "Lunar south pole traverse",
    gravity: "0.16 g",
    radiation: 1.4,
    commDelay: "1.4 s",
    cabin: { co2: 4.2, o2: 20.6, pressure: 70.1, temp: 24.1, humidity: 44 },
  },
};

export type Condition = "fever" | "sleep" | "bp" | "mood";
export interface Astronaut {
  id: string;
  name: string;
  initials: string;
  role: string;
  agency: string;
  country: string;
  age: number;
  bloodType: string;
  env: EnvId;
  missionName: string;
  missionDay: number;
  missionLength: number;
  color: ChartToken;
  xp: number;
  streak: number;
  baseline: {
    hr: number;
    temp: number;
    spo2: number;
    sys: number;
    dia: number;
    glucose: number;
    sleep: number;
    mood: number;
    weight: number;
  };
  condition?: Condition;
}

export const CREW: Astronaut[] = [
  {
    id: "rehab",
    name: "Rehab",
    initials: "R",
    role: "Commander",
    agency: "ESA",
    country: "Sweden",
    age: 38,
    bloodType: "A+",
    env: "iss",
    missionName: "Expedition 76",
    missionDay: 142,
    missionLength: 186,
    color: "chart-1",
    xp: 14280,
    streak: 41,
    baseline: {
      hr: 63,
      temp: 36.6,
      spo2: 98,
      sys: 114,
      dia: 73,
      glucose: 92,
      sleep: 7.4,
      mood: 4.4,
      weight: 62,
    },
  },
  {
    id: "omar",
    name: "Omar Haddad",
    initials: "OH",
    role: "Flight Engineer",
    agency: "MBRSC",
    country: "UAE",
    age: 41,
    bloodType: "O+",
    env: "mars",
    missionName: "Ares Pathfinder I",
    missionDay: 213,
    missionLength: 520,
    color: "chart-3",
    xp: 12950,
    streak: 6,
    baseline: {
      hr: 68,
      temp: 36.7,
      spo2: 97,
      sys: 121,
      dia: 78,
      glucose: 98,
      sleep: 7,
      mood: 4,
      weight: 79,
    },
    condition: "fever",
  },
  {
    id: "kenji",
    name: "Kenji Watanabe",
    initials: "KW",
    role: "Mission Specialist",
    agency: "JAXA",
    country: "Japan",
    age: 45,
    bloodType: "B+",
    env: "gateway",
    missionName: "Artemis V",
    missionDay: 64,
    missionLength: 90,
    color: "chart-6",
    xp: 9870,
    streak: 12,
    baseline: {
      hr: 61,
      temp: 36.5,
      spo2: 98,
      sys: 118,
      dia: 76,
      glucose: 95,
      sleep: 7.1,
      mood: 4.1,
      weight: 70,
    },
    condition: "sleep",
  },
  {
    id: "amara",
    name: "Amara Okafor",
    initials: "AO",
    role: "Medical Officer",
    agency: "NASA",
    country: "USA",
    age: 36,
    bloodType: "AB-",
    env: "iss",
    missionName: "Expedition 76",
    missionDay: 142,
    missionLength: 186,
    color: "chart-2",
    xp: 15620,
    streak: 58,
    baseline: {
      hr: 59,
      temp: 36.6,
      spo2: 99,
      sys: 110,
      dia: 70,
      glucose: 88,
      sleep: 7.8,
      mood: 4.6,
      weight: 64,
    },
  },
  {
    id: "lucas",
    name: "Lucas Moreau",
    initials: "LM",
    role: "Rover Pilot",
    agency: "CNES",
    country: "France",
    age: 43,
    bloodType: "A-",
    env: "rover",
    missionName: "Artemis V",
    missionDay: 31,
    missionLength: 45,
    color: "chart-4",
    xp: 8410,
    streak: 9,
    baseline: {
      hr: 70,
      temp: 36.6,
      spo2: 97,
      sys: 124,
      dia: 80,
      glucose: 101,
      sleep: 6.9,
      mood: 4,
      weight: 83,
    },
    condition: "bp",
  },
  {
    id: "priya",
    name: "Priya Raman",
    initials: "PR",
    role: "Payload Specialist",
    agency: "ISRO",
    country: "India",
    age: 34,
    bloodType: "O-",
    env: "moon",
    missionName: "Artemis V",
    missionDay: 88,
    missionLength: 120,
    color: "chart-5",
    xp: 11030,
    streak: 17,
    baseline: {
      hr: 66,
      temp: 36.5,
      spo2: 98,
      sys: 112,
      dia: 72,
      glucose: 90,
      sleep: 7.3,
      mood: 4.3,
      weight: 55,
    },
    condition: "mood",
  },
];

export const getAstronaut = (id: string) => CREW.find((a) => a.id === id) ?? CREW[0];

export interface DayRecord {
  ts: number;
  date: string;
  inFlight: boolean;
  hr: number;
  hrMax: number;
  hrv: number;
  temp: number;
  spo2: number;
  sys: number;
  dia: number;
  glucose: number;
  sleep: number;
  deepSleep: number;
  mood: number;
  stress: number;
  hydration: number;
  exercise: number;
  radiation: number;
  radiationTotal: number;
  iop: number;
  boneLoss: number;
  muscleMass: number;
  weight: number;
}

const HISTORY_DAYS = 365;

function buildHistory(a: Astronaut, index: number): DayRecord[] {
  const r = rng(1000 + index * 7919);
  const env = ENVIRONMENTS[a.env];
  const b = a.baseline;
  const out: DayRecord[] = [];
  let dose = 0;
  for (let t = 0; t < HISTORY_DAYS; t++) {
    const ago = 364 - t;
    const ts = NOW - ago * DAY;
    const inFlight = ago < a.missionDay;
    const flightDay = inFlight ? a.missionDay - ago : 0;
    const wave = Math.sin(t / 9) * 0.6 + Math.sin(t / 41) * 0.4;
    let hr = b.hr + gauss(r) * 2.6 + wave * 2 + (inFlight ? 2.5 : 0);
    let temp = b.temp + gauss(r) * 0.13 + (inFlight ? 0.12 : 0);
    const spo2 = b.spo2 + gauss(r) * 0.6 - (inFlight && a.env === "rover" ? 0.6 : 0);
    let sys = b.sys + gauss(r) * 4 + wave * 2 + (inFlight ? 2 : 0);
    let dia = b.dia + gauss(r) * 3 + wave;
    const glucose = b.glucose + gauss(r) * 9;
    let sleep = b.sleep + gauss(r) * 0.45 - (inFlight ? 0.35 : 0);
    let mood = b.mood + gauss(r) * 0.28 + wave * 0.1;
    let hydration = 2.6 + gauss(r) * 0.35;
    const iop = 15 + gauss(r) * 1.3 + (inFlight ? Math.min(3, flightDay / 60) : 0);
    const exercise = inFlight
      ? clamp(120 + gauss(r) * 22, 40, 170)
      : clamp(55 + gauss(r) * 20, 0, 120);
    if (a.condition === "fever" && ago < 4) {
      const k = 4 - ago;
      temp = 36.9 + k * 0.4 + gauss(r) * 0.05;
      hr = b.hr + 8 + k * 7;
      sleep = 6.1 - k * 0.2;
      mood = 3.4 - k * 0.15;
      hydration = 1.9;
    }
    if (a.condition === "sleep" && ago < 16) {
      sleep = 5.6 + gauss(r) * 0.35;
      mood = 3.4 + gauss(r) * 0.2;
      hr += 3;
    }
    if (a.condition === "bp" && ago < 11) {
      sys = 133 + (11 - ago) * 0.9 + gauss(r) * 2;
      dia = 85 + gauss(r) * 2;
    }
    if (a.condition === "mood" && ago < 9) {
      mood = 3 + gauss(r) * 0.2;
      sleep -= 0.4;
    }
    const rad = inFlight ? env.radiation * (1 + gauss(r) * 0.08) : 0.008;
    if (inFlight) dose += rad;
    out.push({
      ts,
      date: new Date(ts).toISOString().slice(0, 10),
      inFlight,
      hr: round(clamp(hr, 40, 140)),
      hrMax: round(clamp(hr + 60 + gauss(r) * 10, 100, 185)),
      hrv: round(
        clamp(58 + gauss(r) * 9 - (a.condition === "sleep" && ago < 16 ? 14 : 0), 15, 110),
      ),
      temp: round(temp, 1),
      spo2: round(clamp(spo2, 88, 100)),
      sys: round(sys),
      dia: round(dia),
      glucose: round(clamp(glucose, 60, 200)),
      sleep: round(clamp(sleep, 3, 9.8), 1),
      deepSleep: round(clamp(sleep * 0.21 + gauss(r) * 0.15, 0.4, 2.6), 1),
      mood: round(clamp(mood, 1, 5), 1),
      stress: round(clamp(32 + gauss(r) * 9 + (5 - mood) * 10, 5, 95)),
      hydration: round(clamp(hydration, 0.8, 4.5), 1),
      exercise: round(exercise),
      radiation: round(rad, 2),
      radiationTotal: round(dose, 1),
      iop: round(iop),
      boneLoss: round(inFlight ? -(flightDay / 30) * 1.1 + gauss(r) * 0.05 : 0, 2),
      muscleMass: round(
        inFlight ? 100 - flightDay * 0.018 + gauss(r) * 0.2 : 100 + gauss(r) * 0.2,
        1,
      ),
      weight: round(
        b.weight - (inFlight ? Math.min(2.4, flightDay * 0.012) : 0) + gauss(r) * 0.3,
        1,
      ),
    });
  }
  return out;
}

export const HISTORY: Record<string, DayRecord[]> = Object.fromEntries(
  CREW.map((a, i) => [a.id, buildHistory(a, i)]),
);
export const latest = (id: string) => HISTORY[id][HISTORY[id].length - 1];
export const previous = (id: string) => HISTORY[id][HISTORY[id].length - 2];

const OVERALL_METRICS: MetricKey[] = [
  "hr",
  "temp",
  "spo2",
  "sys",
  "glucose",
  "sleep",
  "mood",
  "iop",
];
/** Most serious status across an astronaut's latest core readings. */
export function overallStatus(id: string): Status {
  const r = latest(id);
  return worstStatus(OVERALL_METRICS.map((m) => statusOf(m, r[m])).concat(statusOf("dia", r.dia)));
}

export interface IntradaySample {
  ts: number;
  time: string;
  hr: number;
  spo2: number;
  temp: number;
}
/** 5-minute samples from 00:00 to now for today. */
export function todaySamples(id: string): IntradaySample[] {
  const a = getAstronaut(id);
  const r = latest(id);
  const g = rng(42 + id.length * 31 + a.age);
  const start = NOW - 52_200_000;
  const out: IntradaySample[] = [];
  for (let t = start; t <= NOW; t += 300_000) {
    const d = new Date(t);
    const h = d.getUTCHours() + d.getUTCMinutes() / 60;
    let hr = r.hr;
    if (h < 6) hr -= 9;
    if (h >= 10 && h < 11.5) hr += 48 * Math.sin(((h - 10) / 1.5) * Math.PI);
    hr += gauss(g) * 2.5;
    out.push({
      ts: t,
      time: `${String(d.getUTCHours()).padStart(2, "0")}:${String(d.getUTCMinutes()).padStart(2, "0")}`,
      hr: Math.round(hr),
      spo2: Math.round(clamp(r.spo2 + gauss(g) * 0.6 - +(h >= 10 && h < 11.5), 88, 100)),
      temp: round(r.temp - (h < 6 ? 0.3 : 0) + gauss(g) * 0.05, 1),
    });
  }
  return out;
}

export type AlertMetric = MetricKey;
export type AlertSeverity = "watch" | "critical";
export type AlertState = "open" | "acknowledged" | "resolved";
export interface CrewAlert {
  id: string;
  astronautId: string;
  metric: AlertMetric;
  severity: AlertSeverity;
  value: string;
  title: string;
  message: string;
  action: string;
  ts: number;
  state: AlertState;
}

const RECENT_ALERTS: CrewAlert[] = [
  {
    id: "AL-2611",
    astronautId: "omar",
    metric: "temp",
    severity: "critical",
    value: "38.5 °C",
    title: "High body temperature",
    message:
      "Temperature has climbed for 3 consecutive days alongside a resting heart rate of 96 bpm.",
    action:
      "Isolate in crew quarters, take antipyretic per kit card A-3 and open a medical conference with the flight surgeon.",
    ts: NOW - 1_320_000,
    state: "open",
  },
  {
    id: "AL-2610",
    astronautId: "omar",
    metric: "hr",
    severity: "watch",
    value: "96 bpm",
    title: "Elevated resting heart rate",
    message: "Resting HR is 28 bpm above the personal baseline.",
    action: "Rest, hydrate and re-measure in 60 minutes.",
    ts: NOW - 2_820_000,
    state: "open",
  },
  {
    id: "AL-2609",
    astronautId: "lucas",
    metric: "sys",
    severity: "critical",
    value: "142/86 mmHg",
    title: "High blood pressure",
    message:
      "Systolic pressure above 140 mmHg for the second time this week during rover EVA prep.",
    action: "Repeat on both arms after 10 minutes seated. Flight surgeon review scheduled.",
    ts: NOW - 8_640_000,
    state: "acknowledged",
  },
  {
    id: "AL-2608",
    astronautId: "kenji",
    metric: "sleep",
    severity: "critical",
    value: "5.4 h",
    title: "Sleep deprivation",
    message: "Average sleep is below 6 h for 14 nights. Reaction-time test dropped 11%.",
    action: "Shift schedule adjusted: +1 h rest block tonight, cabin light protocol L-2.",
    ts: NOW - 18_000_000,
    state: "acknowledged",
  },
  {
    id: "AL-2607",
    astronautId: "priya",
    metric: "mood",
    severity: "watch",
    value: "3.0 / 5",
    title: "Low mood trend",
    message: "Mood check-ins have trended down for 8 days after a long lunar night.",
    action: "Private family conference booked for 18:00 MT. Hobby block added.",
    ts: NOW - 27_000_000,
    state: "open",
  },
  {
    id: "AL-2606",
    astronautId: "rehab",
    metric: "iop",
    severity: "watch",
    value: "22 mmHg",
    title: "Eye pressure slightly high",
    message: "Right-eye tonometer reading above 21 mmHg. Possible early SANS sign.",
    action: "Avoid head-down posture; OCT scan scheduled tomorrow 09:00.",
    ts: NOW - 93_600_000,
    state: "resolved",
  },
  {
    id: "AL-2605",
    astronautId: "lucas",
    metric: "spo2",
    severity: "watch",
    value: "93 %",
    title: "Blood oxygen dipped",
    message: "SpO₂ dipped during rover cabin depress test.",
    action: "Cabin O₂ partial pressure raised; re-test passed at 97 %.",
    ts: NOW - 108_000_000,
    state: "resolved",
  },
  {
    id: "AL-2604",
    astronautId: "amara",
    metric: "glucose",
    severity: "watch",
    value: "152 mg/dL",
    title: "Post-meal glucose spike",
    message: "Glucose peaked after a high-carb rehydratable meal.",
    action: "Swap meal pack M-14 for M-22 on rotation.",
    ts: NOW - 2 * DAY - 10_800_000,
    state: "resolved",
  },
];

function olderAlerts(): CrewAlert[] {
  const r = rng(777);
  const templates: Omit<CrewAlert, "id" | "astronautId" | "ts" | "state">[] = [
    {
      metric: "hydration",
      severity: "watch",
      value: "1.4 L",
      title: "Low hydration",
      message: "Daily water intake below 1.5 L.",
      action: "Drink 500 ml within the hour; reminder set every 90 min.",
    },
    {
      metric: "sleep",
      severity: "watch",
      value: "6.2 h",
      title: "Short sleep",
      message: "Sleep under 6.5 h after late robotic-arm operation.",
      action: "Rest block extended by 45 minutes.",
    },
    {
      metric: "hr",
      severity: "watch",
      value: "104 bpm",
      title: "High HR at rest",
      message: "Elevated resting heart rate after EVA.",
      action: "Cool-down protocol and re-measure after 30 min.",
    },
    {
      metric: "radiation",
      severity: "watch",
      value: "1.38 mSv",
      title: "Solar particle event",
      message: "Daily dose increased during minor solar particle event.",
      action: "Sleep in shielded quarters for 48 h.",
    },
    {
      metric: "glucose",
      severity: "watch",
      value: "64 mg/dL",
      title: "Low blood sugar",
      message: "Glucose low before exercise session.",
      action: "Eat a 15 g carb snack and re-test after 15 min.",
    },
    {
      metric: "temp",
      severity: "watch",
      value: "37.7 °C",
      title: "Mild temperature rise",
      message: "Temperature slightly elevated after exercise.",
      action: "Re-check in 1 h. Resolved at 36.9 °C.",
    },
    {
      metric: "mood",
      severity: "watch",
      value: "3.2 / 5",
      title: "Mood dip",
      message: "Mood lower than baseline after workload peak.",
      action: "Crew movie night scheduled.",
    },
    {
      metric: "sys",
      severity: "watch",
      value: "134/84 mmHg",
      title: "Borderline pressure",
      message: "Systolic pressure borderline high.",
      action: "Reduce sodium intake for 3 days.",
    },
    {
      metric: "spo2",
      severity: "critical",
      value: "91 %",
      title: "Low blood oxygen",
      message: "SpO₂ below 92 % during CO₂ scrubber maintenance.",
      action: "O₂ mask applied; cabin CO₂ restored to nominal.",
    },
  ];
  const out: CrewAlert[] = [];
  for (let i = 0; i < 34; i++) {
    const tpl = templates[Math.floor(r() * templates.length)];
    const who = CREW[Math.floor(r() * CREW.length)];
    out.push({
      ...tpl,
      id: `AL-${2603 - i}`,
      astronautId: who.id,
      ts: NOW - (3 + i * 2.6 + r() * 2) * DAY,
      state: "resolved",
    });
  }
  return out;
}

export const ALERTS: CrewAlert[] = [...RECENT_ALERTS, ...olderAlerts()];

export type TaskCategory = "Measure" | "Move" | "Nutrition" | "Mind" | "Recover";
export interface HealthTask {
  id: string;
  title: string;
  detail: string;
  xp: number;
  category: TaskCategory;
  time: string;
  duration: string;
}
export const TASKS: HealthTask[] = [
  {
    id: "t1",
    title: "Morning vitals check",
    detail: "HR, BP, SpO₂ and temperature with the BOO smart helmet",
    xp: 50,
    category: "Measure",
    time: "06:30",
    duration: "4 min",
  },
  {
    id: "t2",
    title: "Blood glucose finger-stick",
    detail: "Fasting reading before breakfast",
    xp: 40,
    category: "Measure",
    time: "07:00",
    duration: "2 min",
  },
  {
    id: "t3",
    title: "ARED resistance training",
    detail: "Squats, deadlifts, heel raises — protect bone & muscle",
    xp: 120,
    category: "Move",
    time: "10:00",
    duration: "90 min",
  },
  {
    id: "t4",
    title: "Hydration goal 2.5 L",
    detail: "Log each pouch in the BOO app",
    xp: 60,
    category: "Nutrition",
    time: "All day",
    duration: "—",
  },
  {
    id: "t5",
    title: "Treadmill (T2) cardio",
    detail: "Harness load 70 % body weight, 30 min zone 2",
    xp: 90,
    category: "Move",
    time: "15:00",
    duration: "30 min",
  },
  {
    id: "t6",
    title: "Self ultrasound — tibia",
    detail: "Guided scan to track bone density",
    xp: 100,
    category: "Measure",
    time: "16:30",
    duration: "15 min",
  },
  {
    id: "t7",
    title: "Mood & stress journal",
    detail: "Three quick questions and a free note",
    xp: 40,
    category: "Mind",
    time: "21:00",
    duration: "3 min",
  },
  {
    id: "t8",
    title: "Wind-down: lights to amber",
    detail: "Dim cabin LEDs 1 h before sleep",
    xp: 30,
    category: "Recover",
    time: "21:30",
    duration: "60 min",
  },
];

const TASK_DUE: Record<string, number> = {
  t1: 6.6,
  t2: 7.1,
  t3: 11.5,
  t4: 23,
  t5: 15.5,
  t6: 16.8,
  t7: 21.1,
  t8: 22.5,
};
/** Whether a task is already done at mission "now" (Omar skips exercise while feverish). */
export function taskDoneByDefault(astronautId: string, taskId: string) {
  const h = new Date(NOW).getUTCHours() + new Date(NOW).getUTCMinutes() / 60;
  if (astronautId === "omar" && (taskId === "t3" || taskId === "t5")) return false;
  return (TASK_DUE[taskId] ?? 99) < h;
}

export type BadgeIcon =
  "flame" | "droplet" | "shield" | "dumbbell" | "moon" | "heart" | "brain" | "rocket";
export interface Badge {
  id: string;
  name: string;
  detail: string;
  icon: BadgeIcon;
  earned: boolean;
  progress?: number;
}
export const BADGES: Badge[] = [
  {
    id: "b1",
    name: "40-Day Streak",
    detail: "Logged vitals 40 days in a row",
    icon: "flame",
    earned: true,
  },
  {
    id: "b2",
    name: "Hydro Hero",
    detail: "Hit hydration goal 30 days",
    icon: "droplet",
    earned: true,
  },
  {
    id: "b3",
    name: "Bone Guardian",
    detail: "Bone loss under 1 %/month",
    icon: "shield",
    earned: true,
  },
  { id: "b4", name: "Iron Astronaut", detail: "100 ARED sessions", icon: "dumbbell", earned: true },
  {
    id: "b5",
    name: "Deep Sleeper",
    detail: "7+ h sleep for 21 nights",
    icon: "moon",
    earned: false,
    progress: 71,
  },
  {
    id: "b6",
    name: "Steady Heart",
    detail: "Resting HR in range 60 days",
    icon: "heart",
    earned: false,
    progress: 84,
  },
  {
    id: "b7",
    name: "Mind Balance",
    detail: "Mood journal 50 times",
    icon: "brain",
    earned: false,
    progress: 46,
  },
  {
    id: "b8",
    name: "Mission Ready",
    detail: "All indicators green for 14 days",
    icon: "rocket",
    earned: false,
    progress: 29,
  },
];

export const ROUTINE = [
  { time: "06:00", title: "Wake up & post-sleep check", kind: "Measure" },
  { time: "08:00", title: "Daily planning conference", kind: "Ops" },
  { time: "10:00", title: "ARED exercise", kind: "Move" },
  { time: "12:30", title: "Lunch · menu M-22", kind: "Nutrition" },
  { time: "15:00", title: "T2 treadmill", kind: "Move" },
  { time: "16:30", title: "Tibia ultrasound", kind: "Measure" },
  { time: "18:00", title: "Private family conference", kind: "Mind" },
  { time: "21:00", title: "Mood journal & wind-down", kind: "Recover" },
];

export const DEVICE = {
  name: "BOO Helmet S2",
  serial: "BOO-S2-0476-ESA",
  battery: 85,
  connection: "Bluetooth LE · ESP32",
  firmware: "v1.0.4",
  lastSync: NOW - 120_000,
  storage: { used: 1.8, total: 4 },
  sensors: [
    { name: "Forehead optical HR / SpO₂ (PPG)", status: "OK", accuracy: "± 2 bpm" },
    { name: "Forehead skin temperature", status: "OK", accuracy: "± 0.1 °C" },
    { name: "In-helmet CO₂ & breathing sensor", status: "OK", accuracy: "± 50 ppm" },
    { name: "3-axis head-motion accelerometer", status: "OK", accuracy: "—" },
    { name: "Personal dosimeter", status: "OK", accuracy: "± 3 %" },
    {
      name: "Blood pressure",
      status: "Manual now · Auto in next helmet version",
      accuracy: "Manual log",
    },
    {
      name: "Blood sugar",
      status: "Manual now · Auto in next helmet version",
      accuracy: "Manual log",
    },
  ],
};

const fmtCache = new Map<string, Intl.DateTimeFormat>();
function fmt(opts: Intl.DateTimeFormatOptions) {
  const k = JSON.stringify(opts);
  if (!fmtCache.has(k))
    fmtCache.set(k, new Intl.DateTimeFormat("en-US", { timeZone: "UTC", ...opts }));
  return fmtCache.get(k)!;
}
export const fmtWeekday = (ts: number) => fmt({ weekday: "short" }).format(ts);
export const fmtShortDate = (ts: number) => fmt({ month: "short", day: "numeric" }).format(ts);
export const fmtLongDate = (ts: number) =>
  fmt({ weekday: "long", month: "long", day: "numeric", year: "numeric" }).format(ts);
export const fmtTime = (ts: number) =>
  fmt({ hour: "2-digit", minute: "2-digit", hour12: false }).format(ts);
export function timeAgo(ts: number) {
  const mins = Math.round((NOW - ts) / 60_000);
  if (mins < 60) return `${mins} min ago`;
  const h = Math.round(mins / 60);
  return h < 24 ? `${h} h ago` : `${Math.round(h / 24)} d ago`;
}
