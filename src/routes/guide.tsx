import { jsx, jsxs } from "react/jsx-runtime";
import { createFileRoute } from "@tanstack/react-router";
import {
  Radiation as c,
  Brain as s,
  Earth as f,
  Orbit as re,
  Wind as l,
  Ruler as p,
  PhoneCall as ie,
} from "lucide-react";
import { PageHeader as r, Surface as a } from "@/components/boo/ui";
import { METRICS as i, type MetricKey } from "@/lib/health/metrics";
import { METRIC_ICON as u } from "@/components/boo/metric-icons";
import {
  Accordion as Me,
  AccordionItem as X,
  AccordionTrigger as Z,
  AccordionContent as Q,
} from "@/components/ui/accordion";
const C = { jsx, jsxs };
export const Route = createFileRoute("/guide")({
  head: () => ({
    meta: [
      { title: "Health Guide · BOO Astronaut Health" },
      {
        name: "description",
        content:
          "Understand spaceflight hazards and how to measure and interpret every health indicator.",
      },
      { property: "og:title", content: "Health Guide · BOO Astronaut Health" },
      {
        property: "og:description",
        content:
          "Understand spaceflight hazards and how to measure and interpret every health indicator.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pe,
});
var Ne = [
    {
      icon: c,
      name: `Space radiation`,
      text: `Cosmic rays and solar storms can damage cells, raising cancer and heart-disease risk.`,
      fix: `Dosimeter, shielded sleep quarters, storm shelter.`,
    },
    {
      icon: s,
      name: `Isolation & confinement`,
      text: `Small crews in tight spaces for months affect sleep, mood and teamwork.`,
      fix: `Daily mood log, private calls, fixed sleep routine.`,
    },
    {
      icon: f,
      name: `Distance from Earth`,
      text: `Mars is up to 22 minutes away by radio — crews must handle problems alone.`,
      fix: `Self-assessment tools, onboard medical kit, clear protocols.`,
    },
    {
      icon: re,
      name: `Gravity fields`,
      text: `Weightlessness weakens bones, muscles and heart, and shifts fluids to the head.`,
      fix: `2.5 h daily exercise, ultrasound, eye checks.`,
    },
    {
      icon: l,
      name: `Hostile closed environment`,
      text: `CO₂, dust, microbes and noise build up inside the spacecraft.`,
      fix: `Cabin monitoring, hygiene, SpO₂ checks.`,
    },
  ],
  $: Record<MetricKey, { how: string; why: string; call: string }> = {
    hr: {
      how: `Worn BOO band reads continuously. For a manual check, sit still for 5 min and count your wrist pulse for 30 s × 2.`,
      why: `Shows heart workload, fever, stress and dehydration.`,
      call: `Resting above 110 or below 45 bpm, or with chest pain.`,
    },
    temp: {
      how: `Band skin sensor every 5 min. Confirm with the oral thermometer from kit drawer M-1.`,
      why: `Early sign of infection — immunity drops in space.`,
      call: `Above 38.0 °C, or above 37.5 °C for more than 24 h.`,
    },
    spo2: {
      how: `Optical sensor on the band, or finger clip after EVA.`,
      why: `Tells how well oxygen reaches your blood.`,
      call: `Below 92 % after re-checking the sensor.`,
    },
    sys: {
      how: `Cuff on left arm, seated, feet flat (or strapped). Rest 5 min first.`,
      why: `Fluid shifts and stress change blood pressure.`,
      call: `140/90 mmHg or higher twice in a row.`,
    },
    dia: {
      how: `Measured with systolic using the same cuff.`,
      why: `The pressure between heartbeats.`,
      call: `90 mmHg or higher twice in a row.`,
    },
    glucose: {
      how: `Finger-stick meter before breakfast and 2 h after a meal.`,
      why: `Spaceflight can reduce insulin sensitivity.`,
      call: `Above 180 or below 60 mg/dL.`,
    },
    sleep: {
      how: `Band tracks movement and HR at night. Add a short note on how rested you feel.`,
      why: `Fatigue slows reaction time and raises error risk.`,
      call: `Under 6 h for 3 nights in a row.`,
    },
    mood: {
      how: `Answer 3 quick questions in BOO each evening (1–5 scale).`,
      why: `Catches stress, low mood or conflict early.`,
      call: `2 or below for 3 days, or any thought of self-harm.`,
    },
    iop: {
      how: `Handheld tonometer once a week, both eyes.`,
      why: `Screens for SANS — swelling at the back of the eye.`,
      call: `Above 24 mmHg, or sudden vision change.`,
    },
    hydration: {
      how: `Log each water pouch (0.5 L) in BOO.`,
      why: `Thirst is weaker in space; dehydration adds kidney-stone risk.`,
      call: `Under 1.5 L/day with dark urine or dizziness.`,
    },
    radiation: {
      how: `Personal dosimeter clipped to clothing at all times.`,
      why: `Tracks your daily and lifetime dose limits.`,
      call: `Daily dose above 1.5 mSv or a solar-storm alert.`,
    },
  };
function Pe() {
  return (0, C.jsxs)(`div`, {
    className: `space-y-8`,
    children: [
      (0, C.jsx)(r, {
        eyebrow: `Health guide`,
        title: `Know your body in space`,
        description: `You don't need to be a doctor. Here is what each reading means, how to take it and when to ask the flight surgeon for help.`,
      }),
      (0, C.jsxs)(`section`, {
        children: [
          (0, C.jsx)(`h2`, {
            className: `mb-4 text-xl font-bold text-foreground`,
            children: `The five hazards of spaceflight`,
          }),
          (0, C.jsx)(`div`, {
            className: `grid gap-4 sm:grid-cols-2 lg:grid-cols-5`,
            children: Ne.map((e, t) =>
              (0, C.jsxs)(
                a,
                {
                  className: `animate-rise`,
                  children: [
                    (0, C.jsx)(`span`, {
                      className: `inline-flex size-11 items-center justify-center rounded-2xl bg-gradient-primary text-primary-foreground shadow-glow`,
                      children: (0, C.jsx)(e.icon, { className: `size-5` }),
                    }),
                    (0, C.jsxs)(`p`, {
                      className: `mt-3 text-xs font-bold text-muted-foreground`,
                      children: [`0`, t + 1],
                    }),
                    (0, C.jsx)(`h3`, {
                      className: `font-bold text-foreground`,
                      children: e.name,
                    }),
                    (0, C.jsx)(`p`, {
                      className: `mt-1 text-sm text-muted-foreground`,
                      children: e.text,
                    }),
                    (0, C.jsx)(`p`, {
                      className: `mt-3 rounded-xl bg-accent px-3 py-2 text-xs font-semibold text-accent-foreground`,
                      children: e.fix,
                    }),
                  ],
                },
                e.name,
              ),
            ),
          }),
        ],
      }),
      (0, C.jsxs)(`section`, {
        children: [
          (0, C.jsx)(`h2`, {
            className: `mb-4 text-xl font-bold text-foreground`,
            children: `Health indicators`,
          }),
          (0, C.jsx)(a, {
            className: `p-2 md:p-3`,
            children: (0, C.jsx)(Me, {
              type: `single`,
              collapsible: !0,
              defaultValue: `hr`,
              children: (Object.keys($) as MetricKey[]).map((e) => {
                let t = i[e],
                  n = u[e],
                  r = $[e];
                return (0, C.jsxs)(
                  X,
                  {
                    value: e,
                    className: `border-border px-3`,
                    children: [
                      (0, C.jsx)(Z, {
                        className: `hover:no-underline`,
                        children: (0, C.jsxs)(`span`, {
                          className: `flex items-center gap-3 text-left`,
                          children: [
                            (0, C.jsx)(`span`, {
                              className: `inline-flex size-10 items-center justify-center rounded-xl bg-accent text-accent-foreground`,
                              children: (0, C.jsx)(n, { className: `size-5` }),
                            }),
                            (0, C.jsxs)(`span`, {
                              children: [
                                (0, C.jsx)(`span`, {
                                  className: `block font-semibold text-foreground`,
                                  children: t.label,
                                }),
                                (0, C.jsxs)(`span`, {
                                  className: `block text-xs font-normal text-muted-foreground`,
                                  children: [
                                    `Healthy: `,
                                    t.normal[0],
                                    `–`,
                                    t.normal[1],
                                    ` `,
                                    t.unit,
                                  ],
                                }),
                              ],
                            }),
                          ],
                        }),
                      }),
                      (0, C.jsxs)(Q, {
                        children: [
                          (0, C.jsxs)(`div`, {
                            className: `grid gap-3 pb-2 md:grid-cols-3`,
                            children: [
                              (0, C.jsxs)(`div`, {
                                className: `rounded-2xl bg-muted p-4`,
                                children: [
                                  (0, C.jsxs)(`p`, {
                                    className: `mb-1 flex items-center gap-1.5 text-xs font-bold text-primary uppercase`,
                                    children: [
                                      (0, C.jsx)(p, { className: `size-3.5` }),
                                      ` How to measure`,
                                    ],
                                  }),
                                  (0, C.jsx)(`p`, {
                                    className: `text-sm text-foreground`,
                                    children: r.how,
                                  }),
                                ],
                              }),
                              (0, C.jsxs)(`div`, {
                                className: `rounded-2xl bg-muted p-4`,
                                children: [
                                  (0, C.jsx)(`p`, {
                                    className: `mb-1 text-xs font-bold text-primary uppercase`,
                                    children: `Why it matters`,
                                  }),
                                  (0, C.jsx)(`p`, {
                                    className: `text-sm text-foreground`,
                                    children: r.why,
                                  }),
                                ],
                              }),
                              (0, C.jsxs)(`div`, {
                                className: `rounded-2xl border border-destructive/20 bg-destructive/5 p-4`,
                                children: [
                                  (0, C.jsxs)(`p`, {
                                    className: `mb-1 flex items-center gap-1.5 text-xs font-bold text-destructive uppercase`,
                                    children: [
                                      (0, C.jsx)(ie, { className: `size-3.5` }),
                                      ` Call the flight surgeon`,
                                    ],
                                  }),
                                  (0, C.jsx)(`p`, {
                                    className: `text-sm text-foreground`,
                                    children: r.call,
                                  }),
                                ],
                              }),
                            ],
                          }),
                          (0, C.jsxs)(`div`, {
                            className: `flex flex-wrap gap-2 pb-2 text-xs font-semibold`,
                            children: [
                              (0, C.jsxs)(`span`, {
                                className: `rounded-full bg-success/10 px-3 py-1 text-success`,
                                children: [`Normal `, t.normal[0], `–`, t.normal[1]],
                              }),
                              (0, C.jsxs)(`span`, {
                                className: `rounded-full bg-warning/15 px-3 py-1 text-warning-foreground`,
                                children: [`Watch `, t.watch[0], `–`, t.watch[1]],
                              }),
                              (0, C.jsxs)(`span`, {
                                className: `rounded-full bg-destructive/10 px-3 py-1 text-destructive`,
                                children: [`Critical outside `, t.watch[0], `–`, t.watch[1]],
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  },
                  e,
                );
              }),
            }),
          }),
        ],
      }),
    ],
  });
}
