import { DemoOnly } from "@/components/boo/DemoOnly";
import * as x from "react";
import type { KeyboardEvent } from "react";
import { jsx, jsxs } from "react/jsx-runtime";
import { createFileRoute, Link as n } from "@tanstack/react-router";
import {
  MousePointerClick as b,
  CircleCheck as p,
  TriangleAlert as m,
  Info as y,
  BookOpen as v,
} from "lucide-react";
import { PageHeader as i, Surface as l, StatusPill as c } from "@/components/boo/ui";
import {
  METRICS as a,
  STATUS_STYLE as o,
  statusOf as s,
  worstStatus as u,
  type MetricKey,
  type Status,
} from "@/lib/health/metrics";
import { latest as d, type DayRecord } from "@/lib/health/data";
import { useAppState as g } from "@/lib/app-state";
import { Button as _ } from "@/components/ui/button";
import { cn as h } from "@/lib/utils";
type Indicator = { label: string; value: string; status: Status };
type BodyArea = {
  id: string;
  name: string;
  system: string;
  func: string;
  hazard: string;
  hazardTag: string;
  actions: string[];
  indicators: (sample: DayRecord) => Indicator[];
};
export const Route = createFileRoute("/_authenticated/body")({
  head: () => ({
    meta: [
      { title: "Body Map · BOO Astronaut Health" },
      {
        name: "description",
        content: "Explore body systems, latest readings and the effects of spaceflight.",
      },
      { property: "og:title", content: "Body Map · BOO Astronaut Health" },
      {
        property: "og:description",
        content: "Explore body systems, latest readings and the effects of spaceflight.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: DGate,
});
const S = (e: MetricKey, t: DayRecord): Indicator => ({
    label: a[e].label,
    value: `${t[e].toFixed(a[e].decimals)} ${a[e].unit}`,
    status: s(e, t[e]),
  }),
  C: BodyArea[] = [
    {
      id: `brain`,
      name: `Brain & Mind`,
      system: `Nervous system`,
      func: `Controls thinking, mood, sleep cycles, balance and reaction time — all critical for safe operations.`,
      hazard: `Isolation, confinement and a 90-minute day/night cycle disturb sleep and mood. Fluid shifts can raise pressure in the skull.`,
      hazardTag: `Isolation & confinement`,
      actions: [
        `Keep a fixed sleep window and dim lights 1 h before rest`,
        `Log mood daily — 30 seconds is enough`,
        `Book private calls with family every week`,
      ],
      indicators: (e) => [
        S(`mood`, e),
        S(`sleep`, e),
        {
          label: `Stress score`,
          value: `${e.stress}/100`,
          status: e.stress > 60 ? `watch` : `normal`,
        },
      ],
    },
    {
      id: `eyes`,
      name: `Eyes`,
      system: `Vision`,
      func: `Vision is needed for docking, robotics and reading displays. The optic nerve links the eye to the brain.`,
      hazard: `Fluids shift toward the head in weightlessness, which can flatten the eyeball and swell the optic nerve (SANS).`,
      hazardTag: `Altered gravity`,
      actions: [
        `Weekly tonometer check of eye pressure`,
        `Monthly OCT eye scan`,
        `Report blurry near-vision right away`,
      ],
      indicators: (e) => [
        S(`iop`, e),
        { label: `Near-vision test`, value: `20/20`, status: `normal` },
      ],
    },
    {
      id: `heart`,
      name: `Heart`,
      system: `Cardiovascular`,
      func: `Pumps blood, oxygen and nutrients. In space it works less against gravity and can shrink slightly.`,
      hazard: `Without gravity the heart deconditions; radiation may raise long-term cardiovascular risk. Dizziness on return is common.`,
      hazardTag: `Altered gravity · Radiation`,
      actions: [
        `2.5 h of daily exercise keeps the heart strong`,
        `Measure blood pressure every morning`,
        `Limit salt in rehydratable meals`,
      ],
      indicators: (e) => [
        S(`hr`, e),
        {
          label: `Blood pressure`,
          value: `${e.sys}/${e.dia} mmHg`,
          status:
            s(`sys`, e.sys) === `normal` && s(`dia`, e.dia) === `normal`
              ? `normal`
              : s(`sys`, e.sys) === `critical` || s(`dia`, e.dia) === `critical`
                ? `critical`
                : `watch`,
        },
        {
          label: `Heart-rate variability`,
          value: `${e.hrv} ms`,
          status: e.hrv < 35 ? `watch` : `normal`,
        },
      ],
    },
    {
      id: `lungs`,
      name: `Lungs`,
      system: `Respiratory`,
      func: `Bring oxygen into the blood and remove carbon dioxide.`,
      hazard: `High cabin CO₂, lunar dust and closed air can irritate the airways and lower blood oxygen.`,
      hazardTag: `Hostile closed environment`,
      actions: [
        `Check SpO₂ after every EVA`,
        `Report headaches — they can signal high CO₂`,
        `Clean suit filters after lunar surface work`,
      ],
      indicators: (e) => [
        S(`spo2`, e),
        { label: `Breathing rate`, value: `14 /min`, status: `normal` },
      ],
    },
    {
      id: `immune`,
      name: `Immune System`,
      system: `Lymphatic & immune`,
      func: `Fights infections and repairs tissue. Lymph nodes in the neck and armpits are key stations.`,
      hazard: `Stress, radiation and closed environments weaken immunity and can wake up dormant viruses.`,
      hazardTag: `Radiation · Closed environment`,
      actions: [
        `Take temperature morning and evening when unwell`,
        `Wash hands before every meal`,
        `Isolate early if fever appears`,
      ],
      indicators: (e) => [
        S(`temp`, e),
        { label: `White blood cells`, value: `6.4 ×10⁹/L`, status: `normal` },
      ],
    },
    {
      id: `gut`,
      name: `Gut & Metabolism`,
      system: `Digestive`,
      func: `Turns food into energy, controls blood sugar and keeps the body hydrated.`,
      hazard: `Limited menus and changes in gut bacteria affect nutrition; astronauts often drink less without feeling thirsty.`,
      hazardTag: `Distance from Earth`,
      actions: [
        `Drink at least 2.5 L every day`,
        `Rotate meal packs for vitamins`,
        `Test blood sugar before exercise`,
      ],
      indicators: (e) => [
        S(`glucose`, e),
        S(`hydration`, e),
        { label: `Body weight`, value: `${e.weight} kg`, status: `normal` },
      ],
    },
    {
      id: `muscles`,
      name: `Muscles`,
      system: `Musculoskeletal`,
      func: `Move the body and support posture. Back and leg muscles hold us up on Earth.`,
      hazard: `In microgravity muscles are barely used and can lose up to 20 % of mass on long missions.`,
      hazardTag: `Altered gravity`,
      actions: [
        `ARED resistance training 6 days a week`,
        `Focus on calves, quads and lower back`,
        `Eat 1.2 g protein per kg body weight`,
      ],
      indicators: (e) => [
        {
          label: `Muscle mass vs pre-flight`,
          value: `${e.muscleMass}%`,
          status: e.muscleMass < 94 ? `critical` : e.muscleMass < 97 ? `watch` : `normal`,
        },
        {
          label: `Exercise today`,
          value: `${e.exercise} min`,
          status: e.exercise < 90 ? `watch` : `normal`,
        },
      ],
    },
    {
      id: `bones`,
      name: `Bones`,
      system: `Skeletal`,
      func: `Protect organs, store calcium and carry body weight.`,
      hazard: `Without load, hips and legs lose 1–1.5 % of bone mass per month, raising fracture and kidney-stone risk.`,
      hazardTag: `Altered gravity`,
      actions: [
        `Weekly self-ultrasound of the tibia`,
        `Vitamin D and calcium with breakfast`,
        `Heavy squats and heel raises on ARED`,
      ],
      indicators: (e) => [
        {
          label: `Bone density change`,
          value: `${e.boneLoss.toFixed(1)}%`,
          status: e.boneLoss < -8 ? `critical` : e.boneLoss < -4 ? `watch` : `normal`,
        },
        { label: `Urine calcium`, value: `212 mg/day`, status: `normal` },
      ],
    },
    {
      id: `skin`,
      name: `Skin & Radiation`,
      system: `Integumentary`,
      func: `The body's outer shield. Personal dosimeters on the skin track how much radiation reaches you.`,
      hazard: `Outside Earth's magnetic field, cosmic rays and solar storms raise cancer and tissue-damage risk.`,
      hazardTag: `Space radiation`,
      actions: [
        `Wear your dosimeter at all times`,
        `Sleep in the shielded crew quarters`,
        `Shelter during solar particle events`,
      ],
      indicators: (e) => [
        S(`radiation`, e),
        {
          label: `Mission total`,
          value: `${e.radiationTotal} mSv`,
          status: e.radiationTotal > 400 ? `watch` : `normal`,
        },
      ],
    },
  ],
  w = { jsx, jsxs },
  T: Record<Status, string> = {
    normal: `fill-success/30 hover:fill-success/50`,
    watch: `fill-warning/45 hover:fill-warning/65`,
    critical: `fill-destructive/45 hover:fill-destructive/65`,
  };
function E({
  statuses: e,
  selected: t,
  onSelect: n,
}: {
  statuses: Record<string, Status>;
  selected: string;
  onSelect: (id: string) => void;
}) {
  let r = (n: string) =>
      h(
        `cursor-pointer transition-all duration-300 outline-none`,
        T[e[n]],
        t === n ? `stroke-primary [stroke-width:2.5]` : `stroke-card [stroke-width:1.5]`,
      ),
    i = (e: string) => ({
      role: `button`,
      tabIndex: 0,
      "aria-label": e,
      onClick: () => n(e),
      onKeyDown: (t: KeyboardEvent<SVGElement>) => (t.key === `Enter` || t.key === ` `) && n(e),
      className: r(e),
    });
  return (0, w.jsxs)(`svg`, {
    viewBox: `0 0 200 430`,
    className: `mx-auto h-full max-h-[560px] w-auto drop-shadow-xl`,
    children: [
      (0, w.jsx)(`defs`, {
        children: (0, w.jsxs)(`linearGradient`, {
          id: `skinGrad`,
          x1: `0`,
          y1: `0`,
          x2: `1`,
          y2: `1`,
          children: [
            (0, w.jsx)(`stop`, { offset: `0%`, stopColor: `var(--accent)` }),
            (0, w.jsx)(`stop`, {
              offset: `100%`,
              stopColor: `var(--secondary)`,
            }),
          ],
        }),
      }),
      (0, w.jsxs)(`g`, {
        ...i(`skin`),
        className: h(
          `cursor-pointer`,
          t === `skin` ? `stroke-primary [stroke-width:2.5]` : `stroke-border [stroke-width:1.5]`,
        ),
        fill: `url(#skinGrad)`,
        children: [
          (0, w.jsx)(`circle`, { cx: `100`, cy: `46`, r: `30` }),
          (0, w.jsx)(`rect`, {
            x: `88`,
            y: `72`,
            width: `24`,
            height: `22`,
            rx: `8`,
          }),
          (0, w.jsx)(`path`, {
            d: `M56 98 Q100 84 144 98 Q152 150 148 212 Q100 230 52 212 Q48 150 56 98 Z`,
          }),
          (0, w.jsx)(`path`, {
            d: `M56 100 Q38 106 34 134 L24 232 Q26 246 38 242 L52 146 Z`,
          }),
          (0, w.jsx)(`path`, {
            d: `M144 100 Q162 106 166 134 L176 232 Q174 246 162 242 L148 146 Z`,
          }),
          (0, w.jsx)(`path`, {
            d: `M54 206 Q76 224 97 220 L93 404 Q86 418 72 410 L62 300 Z`,
          }),
          (0, w.jsx)(`path`, {
            d: `M146 206 Q124 224 103 220 L107 404 Q114 418 128 410 L138 300 Z`,
          }),
        ],
      }),
      (0, w.jsxs)(`g`, {
        ...i(`muscles`),
        children: [
          (0, w.jsx)(`path`, {
            d: `M54 110 Q42 116 40 138 L34 196 Q42 200 48 194 L54 150 Z`,
          }),
          (0, w.jsx)(`path`, {
            d: `M146 110 Q158 116 160 138 L166 196 Q158 200 152 194 L146 150 Z`,
          }),
          (0, w.jsx)(`path`, {
            d: `M62 232 Q74 240 92 238 L90 300 Q78 304 68 298 Z`,
          }),
          (0, w.jsx)(`path`, {
            d: `M138 232 Q126 240 108 238 L110 300 Q122 304 132 298 Z`,
          }),
        ],
      }),
      (0, w.jsxs)(`g`, {
        ...i(`bones`),
        children: [
          (0, w.jsx)(`rect`, {
            x: `74`,
            y: `312`,
            width: `12`,
            height: `88`,
            rx: `6`,
          }),
          (0, w.jsx)(`rect`, {
            x: `114`,
            y: `312`,
            width: `12`,
            height: `88`,
            rx: `6`,
          }),
          (0, w.jsx)(`circle`, { cx: `80`, cy: `306`, r: `7` }),
          (0, w.jsx)(`circle`, { cx: `120`, cy: `306`, r: `7` }),
        ],
      }),
      (0, w.jsx)(`path`, {
        ...i(`brain`),
        d: `M78 40 Q78 18 100 18 Q122 18 122 40 Q122 46 116 46 L84 46 Q78 46 78 40 Z`,
      }),
      (0, w.jsxs)(`g`, {
        ...i(`eyes`),
        children: [
          (0, w.jsx)(`ellipse`, { cx: `90`, cy: `55`, rx: `6`, ry: `4` }),
          (0, w.jsx)(`ellipse`, { cx: `110`, cy: `55`, rx: `6`, ry: `4` }),
        ],
      }),
      (0, w.jsxs)(`g`, {
        ...i(`immune`),
        children: [
          (0, w.jsx)(`circle`, { cx: `86`, cy: `84`, r: `5` }),
          (0, w.jsx)(`circle`, { cx: `114`, cy: `84`, r: `5` }),
          (0, w.jsx)(`circle`, { cx: `60`, cy: `112`, r: `5` }),
          (0, w.jsx)(`circle`, { cx: `140`, cy: `112`, r: `5` }),
        ],
      }),
      (0, w.jsxs)(`g`, {
        ...i(`lungs`),
        children: [
          (0, w.jsx)(`path`, { d: `M94 108 Q72 104 68 130 Q66 156 92 160 Z` }),
          (0, w.jsx)(`path`, {
            d: `M106 108 Q128 104 132 130 Q134 156 108 160 Z`,
          }),
        ],
      }),
      (0, w.jsx)(`path`, {
        ...i(`heart`),
        d: `M104 134 C104 126 114 124 116 132 C118 124 128 126 128 134 C128 144 116 150 116 154 C116 150 104 144 104 134 Z`,
        transform: `translate(-14 -2)`,
      }),
      (0, w.jsx)(`ellipse`, {
        ...i(`gut`),
        cx: `100`,
        cy: `188`,
        rx: `28`,
        ry: `20`,
      }),
    ],
  });
}
function D() {
  let { astronaut: e } = g(),
    t = d(e.id),
    r = C.map((e) => {
      let n = e.indicators(t);
      return { ...e, list: n, status: u(n.map((e) => e.status)) };
    }),
    a = Object.fromEntries(r.map((e) => [e.id, e.status])),
    s = r.find((e) => e.status !== `normal`)?.id ?? `heart`,
    [f, S] = (0, x.useState)<string | null>(null),
    T = r.find((e) => e.id === (f ?? s))!;
  return (0, w.jsxs)(`div`, {
    children: [
      (0, w.jsx)(i, {
        eyebrow: `Interactive body map`,
        title: `${e.name.split(` `)[0]}'s body status`,
        description: `Every area is colored by its latest readings. Tap a part of the body to learn what it does, how space affects it and what to do next.`,
      }),
      (0, w.jsxs)(`div`, {
        className: `grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]`,
        children: [
          (0, w.jsxs)(l, {
            className: `relative flex flex-col bg-gradient-sky`,
            children: [
              (0, w.jsxs)(`div`, {
                className: `mb-3 flex flex-wrap items-center justify-between gap-2`,
                children: [
                  (0, w.jsxs)(`span`, {
                    className: `inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground`,
                    children: [(0, w.jsx)(b, { className: `size-4` }), ` Tap a body area`],
                  }),
                  (0, w.jsxs)(`div`, {
                    className: `flex gap-2`,
                    children: [
                      (0, w.jsx)(c, { status: `normal` }),
                      (0, w.jsx)(c, { status: `watch` }),
                      (0, w.jsx)(c, { status: `critical` }),
                    ],
                  }),
                ],
              }),
              (0, w.jsx)(`div`, {
                className: `flex-1 py-4`,
                children: (0, w.jsx)(E, {
                  statuses: a,
                  selected: T.id,
                  onSelect: S,
                }),
              }),
              (0, w.jsx)(`div`, {
                className: `flex flex-wrap justify-center gap-2`,
                children: r.map((e) =>
                  (0, w.jsxs)(
                    `button`,
                    {
                      type: `button`,
                      onClick: () => S(e.id),
                      className: h(
                        `inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors`,
                        T.id === e.id
                          ? `border-primary bg-primary text-primary-foreground`
                          : `border-border bg-card text-foreground hover:bg-muted`,
                      ),
                      children: [
                        (0, w.jsx)(`span`, {
                          className: h(`size-2 rounded-full`, o[e.status].dot),
                        }),
                        e.name,
                      ],
                    },
                    e.id,
                  ),
                ),
              }),
            ],
          }),
          (0, w.jsxs)(
            `div`,
            {
              className: `animate-rise space-y-4`,
              children: [
                (0, w.jsxs)(l, {
                  children: [
                    (0, w.jsxs)(`div`, {
                      className: `flex items-start justify-between gap-3`,
                      children: [
                        (0, w.jsxs)(`div`, {
                          children: [
                            (0, w.jsx)(`p`, {
                              className: `text-xs font-bold tracking-[0.16em] text-primary uppercase`,
                              children: T.system,
                            }),
                            (0, w.jsx)(`h2`, {
                              className: `mt-1 text-3xl font-bold text-foreground`,
                              children: T.name,
                            }),
                          ],
                        }),
                        (0, w.jsx)(c, {
                          status: T.status,
                          className: `text-sm`,
                        }),
                      ],
                    }),
                    (0, w.jsx)(`p`, {
                      className: `mt-3 text-muted-foreground`,
                      children: T.func,
                    }),
                    (0, w.jsx)(`div`, {
                      className: `mt-5 grid gap-3 sm:grid-cols-2`,
                      children: T.list.map((e) =>
                        (0, w.jsxs)(
                          `div`,
                          {
                            className: h(`rounded-2xl border p-4`, o[e.status].pill),
                            children: [
                              (0, w.jsx)(`p`, {
                                className: `text-xs font-semibold`,
                                children: e.label,
                              }),
                              (0, w.jsx)(`p`, {
                                className: `mt-1 font-display text-2xl font-bold text-foreground tabular`,
                                children: e.value,
                              }),
                            ],
                          },
                          e.label,
                        ),
                      ),
                    }),
                  ],
                }),
                (0, w.jsx)(l, {
                  children: (0, w.jsxs)(`div`, {
                    className: `flex items-start gap-3`,
                    children: [
                      (0, w.jsx)(`span`, {
                        className: `inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-warning/15 text-warning-foreground`,
                        children: (0, w.jsx)(m, { className: `size-5` }),
                      }),
                      (0, w.jsxs)(`div`, {
                        children: [
                          (0, w.jsxs)(`p`, {
                            className: `text-xs font-bold text-warning-foreground uppercase`,
                            children: [`Space hazard · `, T.hazardTag],
                          }),
                          (0, w.jsx)(`p`, {
                            className: `mt-1 text-sm text-foreground`,
                            children: T.hazard,
                          }),
                        ],
                      }),
                    ],
                  }),
                }),
                (0, w.jsxs)(l, {
                  children: [
                    (0, w.jsxs)(`h3`, {
                      className: `mb-3 flex items-center gap-2 font-semibold text-foreground`,
                      children: [
                        (0, w.jsx)(y, { className: `size-4 text-primary` }),
                        ` What you can do`,
                      ],
                    }),
                    (0, w.jsx)(`ul`, {
                      className: `space-y-2.5`,
                      children: T.actions.map((e) =>
                        (0, w.jsxs)(
                          `li`,
                          {
                            className: `flex items-start gap-2.5 text-sm text-foreground`,
                            children: [
                              (0, w.jsx)(p, {
                                className: `mt-0.5 size-4 shrink-0 text-success`,
                              }),
                              ` `,
                              e,
                            ],
                          },
                          e,
                        ),
                      ),
                    }),
                    (0, w.jsx)(_, {
                      asChild: !0,
                      variant: `soft`,
                      className: `mt-5`,
                      children: (0, w.jsxs)(n, {
                        to: `/guide`,
                        children: [(0, w.jsx)(v, {}), ` Read the full guide`],
                      }),
                    }),
                  ],
                }),
              ],
            },
            T.id,
          ),
        ],
      }),
    ],
  });
}

function DGate() {
  return (
    <DemoOnly>
      <D />
    </DemoOnly>
  );
}
