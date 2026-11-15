import { createFileRoute } from "@tanstack/react-router";
import {
  BellRing,
  HeartPulse,
  Radio,
  Watch,
  LayoutDashboard,
  Cloud,
  Users,
  ExternalLink, GraduationCap } from "lucide-react";
import { PageHeader, SectionHead, Surface } from "@/components/boo/ui";
export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About · BOO Astronaut Health" },
      { name: "description", content: "How BOO keeps astronauts safe on long-duration missions." },
      { property: "og:title", content: "About · BOO Astronaut Health" },
      {
        property: "og:description",
        content: "How BOO keeps astronauts safe on long-duration missions.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: About,
});
const architecture = [
  {
    icon: Watch,
    title: "BOO smart helmet & manual logs",
    sub: "HR, SpO₂, temperature, BP, sleep, mood, water",
  },
  {
    icon: LayoutDashboard,
    title: "BOO app",
    sub: "Dashboard, body map, analytics, Arabic & English",
  },
  {
    icon: BellRing,
    title: "Alert engine",
    sub: "Reference ranges → Info / Warning / Critical + action",
  },
  { icon: Cloud, title: "Secure cloud", sub: "Private per-user readings and alerts" },
  {
    icon: Users,
    title: "Flight surgeon & crew",
    sub: "Escalations, or on-board plans in Mars Mode",
  },
];
const sources = [
  {
    name: "NASA Open Science Data Repository (OSDR)",
    url: "https://osdr.nasa.gov/",
    description:
      "Space biology and human physiology datasets, including spaceflight effects on the cardiovascular system, bone and muscle.",
  },
  {
    name: "NASA Human Research Program (HRP)",
    url: "https://www.nasa.gov/hrp/",
    description:
      "The five hazards of human spaceflight (radiation, isolation, distance, gravity, closed environments) and crew health risk research.",
  },
  {
    name: "Where the ISS at? API",
    url: "https://wheretheiss.at/w/developer",
    description: "Free live position, altitude and speed of the International Space Station.",
  },
];
function About() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="NASA Space Apps Challenge 2026"
        title="About & methodology"
        description="How BOO keeps astronauts safe on long-duration missions."
      />
      <div className="grid gap-6 md:grid-cols-2">
        <Surface>
          <SectionHead title="The problem" />
          <p className="text-sm leading-relaxed text-muted-foreground">
            On long missions to the Moon and Mars, astronauts face microgravity, radiation,
            isolation and broken sleep. Bone and muscle loss, eye pressure changes (SANS), fever or
            low oxygen can start silently. Crews are small, the nearest hospital is days or months
            away, and on Mars every message to Earth takes up to 20 minutes one way.
          </p>
        </Surface>
        <Surface>
          <SectionHead title="Our solution" />
          <p className="text-sm leading-relaxed text-muted-foreground">
            BOO is a smart health companion. A smart helmet and simple manual logs feed one app
            that compares every value with reference ranges, colors it green, amber or red, raises
            Info, Warning or Critical alerts with a clear next step, and lets the astronaut
            acknowledge or escalate to the flight surgeon. In Mars Mode it switches to on-board
            decision support because Earth can't answer in time.
          </p>
        </Surface>
      </div>
      <Surface>
        <SectionHead title="Architecture" sub="From the sensor to a decision" />
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {architecture.map((a, i) => (
            <div key={a.title} className="relative rounded-2xl bg-muted p-4">
              <span className="text-xs font-bold text-primary">0{i + 1}</span>
              <a.icon className="my-3 size-6 text-primary" />
              <h3 className="text-sm font-bold text-foreground">{a.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{a.sub}</p>
            </div>
          ))}
        </div>
      </Surface>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: HeartPulse, title: "Live vitals", sub: "Color coded against reference ranges" },
          {
            icon: BellRing,
            title: "Alerts with actions",
            sub: "Acknowledge or escalate in one tap",
          },
          { icon: Radio, title: "Mars Mode", sub: "On-board plans when Earth is 20 min away" },
        ].map((x) => (
          <Surface key={x.title}>
            <x.icon className="mb-3 size-6 text-primary" />
            <h3 className="font-semibold text-foreground">{x.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{x.sub}</p>
          </Surface>
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Surface>
          <SectionHead title="Data sources" />
          <div className="space-y-4">
            {sources.map((s) => (
              <div key={s.url}>
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                >
                  {s.name}
                  <ExternalLink className="size-3.5 shrink-0" />
                </a>
                <p className="mt-1 text-sm text-muted-foreground">{s.description}</p>
              </div>
            ))}
          </div>
        </Surface>
        <Surface>
          <SectionHead title="Methodology" />
          <p className="text-sm leading-relaxed text-muted-foreground">
            Reference ranges come from published clinical norms and NASA crew-health limits, kept in
            one rules file so every screen uses the same thresholds. Vital signs outside the healthy
            band raise a Warning and far outside raise a Critical alert; wellness signals (sleep,
            mood, water) raise Info first. Demo crew data is simulated from these ranges with
            realistic daily rhythms and mission effects.
          </p>
          <p className="mt-4 rounded-2xl bg-warning/10 p-4 text-sm font-semibold text-warning-foreground">
            BOO is a hackathon prototype for screening and education. It is not a medical device.
          </p>
        </Surface>
      </div>
      <Surface>
        <SectionHead icon={<GraduationCap />} title="Who made BOO" sub="NASA Space Apps Challenge 2026" />
        <p className="text-sm leading-relaxed text-muted-foreground">
          BOO was created by Egyptian students from Elsewedy University of Technology and Badr University for the NASA
          Space Apps Challenge 2026 hackathon (6th of October).
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-2xl bg-muted p-4">
          <span className="text-xs font-bold tracking-[0.18em] text-primary uppercase">Team</span>
          <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-gradient-primary font-display text-sm font-bold text-primary-foreground">
            R
          </span>
          <p className="text-sm font-bold text-foreground">Rehab Mohamed Safwat</p>
        </div>
      </Surface>
    </div>
  );
}
