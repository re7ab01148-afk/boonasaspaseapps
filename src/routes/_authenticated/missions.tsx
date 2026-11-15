import { DemoOnly } from "@/components/boo/DemoOnly";
import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Brain,
  Circle,
  CircleCheck,
  Crown,
  Droplet,
  Dumbbell,
  Flame,
  Heart,
  Lock,
  Moon,
  Rocket,
  Shield,
  Trophy,
} from "lucide-react";
import { toast } from "sonner";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AstronautAvatar, PageHeader, Ring, SectionHead, Surface } from "@/components/boo/ui";
import { tooltipStyle } from "@/components/boo/charts";
import { Progress } from "@/components/ui/progress";
import { useAppState } from "@/lib/app-state";
import { BADGES, CREW, historyOf, TASKS, fmtWeekday, taskDoneByDefault } from "@/lib/health/data";
import { XP_PER_LEVEL, levelFromXp } from "@/lib/health/metrics";
import { cn } from "@/lib/utils";

const title = "Missions & XP · BOO Astronaut Health";
const description = "Earn XP through healthy habits, unlock badges and climb the crew leaderboard.";
export const Route = createFileRoute("/_authenticated/missions")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: MissionsPageGate,
});
const icons = {
  flame: Flame,
  droplet: Droplet,
  moon: Moon,
  dumbbell: Dumbbell,
  heart: Heart,
  shield: Shield,
  brain: Brain,
  rocket: Rocket,
};
const categories = {
  Measure: "bg-accent text-accent-foreground",
  Move: "bg-success/10 text-success",
  Recover: "bg-chart-6/10 text-chart-6",
  Mind: "bg-warning/15 text-warning-foreground",
  Nutrition: "bg-chart-5/10 text-chart-5",
};
function MissionsPage() {
  const { astronaut } = useAppState();
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const done = (id: string) =>
    overrides[`${astronaut.id}:${id}`] ?? taskDoneByDefault(astronaut.id, id);
  const earned = TASKS.filter((t) => done(t.id)).reduce((sum, t) => sum + t.xp, 0);
  const possible = TASKS.reduce((sum, t) => sum + t.xp, 0);
  const level = levelFromXp(astronaut.xp + earned);
  const xpData = historyOf(astronaut.id).slice(-14).map((row) => ({
    day: fmtWeekday(row.ts),
    xp: Math.round(300 + row.exercise * 2 + (row.sleep - 6) * 40 + (row.mood - 3) * 50),
  }));
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Gamification"
        title="Health missions"
        description="Every healthy action earns XP. Keep your streak, unlock badges and climb the crew leaderboard."
      />
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <Surface className="flex flex-col items-center bg-gradient-sky text-center">
          <Ring value={level.into} max={XP_PER_LEVEL} size={190} stroke={14}>
            <span className="text-xs font-bold tracking-widest text-muted-foreground uppercase">
              Level
            </span>
            <span className="font-display text-6xl font-extrabold text-gradient-primary">
              {level.level}
            </span>
            <span className="text-xs font-semibold text-muted-foreground tabular">
              {level.into}/{XP_PER_LEVEL} XP
            </span>
          </Ring>
          <h3 className="mt-4 text-xl font-bold text-foreground">{astronaut.name}</h3>
          <p className="text-sm text-muted-foreground">
            {(astronaut.xp + earned).toLocaleString("en-US")} XP total
          </p>
          <div className="mt-4 grid w-full grid-cols-2 gap-3">
            <div className="rounded-2xl bg-card p-3 ring-1 ring-border">
              <Flame className="mx-auto size-5 text-destructive" />
              <p className="font-display text-xl font-bold text-foreground">{astronaut.streak}</p>
              <p className="text-xs text-muted-foreground">day streak</p>
            </div>
            <div className="rounded-2xl bg-card p-3 ring-1 ring-border">
              <Trophy className="mx-auto size-5 text-warning" />
              <p className="font-display text-xl font-bold text-foreground">
                {BADGES.filter((b) => b.earned).length}
              </p>
              <p className="text-xs text-muted-foreground">badges</p>
            </div>
          </div>
        </Surface>
        <Surface>
          <SectionHead
            title="Today's missions"
            sub={`${earned} of ${possible} XP earned`}
            action={
              <span className="rounded-full bg-gradient-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                +{earned} XP
              </span>
            }
          />
          <Progress value={(earned / possible) * 100} className="mb-4 h-2.5" />
          <div className="grid gap-3 md:grid-cols-2">
            {TASKS.map((task) => {
              const checked = done(task.id);
              return (
                <button
                  key={task.id}
                  type="button"
                  aria-pressed={checked}
                  onClick={() => {
                    setOverrides((previous) => ({
                      ...previous,
                      [`${astronaut.id}:${task.id}`]: !checked,
                    }));
                    if (!checked) toast.success(`+${task.xp} XP`, { description: task.title });
                  }}
                  className={cn(
                    "flex items-start gap-3 rounded-2xl border p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-card",
                    checked ? "border-success/30 bg-success/5" : "border-border bg-card",
                  )}
                >
                  {checked ? (
                    <CircleCheck className="mt-0.5 size-5 shrink-0 text-success" />
                  ) : (
                    <Circle className="mt-0.5 size-5 shrink-0 text-muted-foreground" />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-foreground">{task.title}</span>
                      <span className="font-display text-sm font-bold text-primary">
                        +{task.xp}
                      </span>
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {task.detail}
                    </span>
                    <span className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-semibold">
                      <span className={cn("rounded-full px-2 py-0.5", categories[task.category])}>
                        {task.category}
                      </span>
                      <span className="text-muted-foreground">
                        {task.time} · {task.duration}
                      </span>
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </Surface>
      </div>
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <Surface>
          <SectionHead title="Badges" sub="Unlock by building healthy habits" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {BADGES.map((badge) => {
              const Icon = icons[badge.icon];
              return (
                <div
                  key={badge.id}
                  className={cn(
                    "rounded-2xl border p-4 text-center",
                    badge.earned
                      ? "border-primary/20 bg-gradient-sky"
                      : "border-dashed border-border bg-muted/50",
                  )}
                >
                  <span
                    className={cn(
                      "mx-auto inline-flex size-14 items-center justify-center rounded-2xl",
                      badge.earned
                        ? "bg-gradient-primary text-primary-foreground shadow-glow"
                        : "bg-muted text-muted-foreground",
                    )}
                  >
                    {badge.earned ? <Icon className="size-7" /> : <Lock className="size-6" />}
                  </span>
                  <p className="mt-3 text-sm font-bold text-foreground">{badge.name}</p>
                  <p className="text-xs text-muted-foreground">{badge.detail}</p>
                  {!badge.earned && badge.progress !== undefined && (
                    <Progress value={badge.progress} className="mt-3 h-1.5" />
                  )}
                </div>
              );
            })}
          </div>
        </Surface>
        <Surface>
          <SectionHead icon={<Crown />} title="Crew leaderboard" sub="This mission" />
          <ol className="space-y-2">
            {[...CREW]
              .sort((a, b) => b.xp - a.xp)
              .map((a, index) => (
                <li
                  key={a.id}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-3 py-2.5",
                    a.id === astronaut.id ? "bg-accent ring-1 ring-primary/20" : "hover:bg-muted",
                  )}
                >
                  <span
                    className={cn(
                      "w-6 text-center font-display font-bold",
                      index === 0 ? "text-warning" : "text-muted-foreground",
                    )}
                  >
                    {index + 1}
                  </span>
                  <AstronautAvatar a={a} size="sm" />
                  <span className="flex-1">
                    <span className="block text-sm font-semibold text-foreground">{a.name}</span>
                    <span className="block text-xs text-muted-foreground">
                      Level {levelFromXp(a.xp).level}
                    </span>
                  </span>
                  <span className="font-display text-sm font-bold text-foreground tabular">
                    {a.xp.toLocaleString("en-US")}
                  </span>
                </li>
              ))}
          </ol>
        </Surface>
      </div>
      <Surface>
        <SectionHead title="XP earned · last 14 days" />
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={xpData} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 4" />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                width={46}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="xp" name="XP" fill="var(--primary)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Surface>
    </div>
  );
}

function MissionsPageGate() {
  return (
    <DemoOnly>
      <MissionsPage />
    </DemoOnly>
  );
}
