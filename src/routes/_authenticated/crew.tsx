import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AstronautAvatar, PageHeader, SectionHead, StatusPill, Surface } from "@/components/boo/ui";
import { METRIC_ICON } from "@/components/boo/metric-icons";
import { useAppState } from "@/lib/app-state";
import { CREW, ENVIRONMENTS, latest, overallStatus } from "@/lib/health/data";
import { STATUS_LABEL, STATUS_STYLE, statusOf } from "@/lib/health/metrics";
import { cn } from "@/lib/utils";
export const Route = createFileRoute("/_authenticated/crew")({
  head: () => ({
    meta: [
      { title: "Crew · BOO Astronaut Health" },
      {
        name: "description",
        content: "Six astronauts, five worlds. Crew health and mission environments.",
      },
      { property: "og:title", content: "Crew · BOO Astronaut Health" },
      {
        property: "og:description",
        content: "Six astronauts, five worlds. Crew health and mission environments.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Crew,
});
function Crew() {
  const { alerts, setAstronautId } = useAppState();
  const navigate = useNavigate();
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Crew overview"
        title="Six astronauts, five worlds"
        description="Flight surgeons and commanders see the whole crew at a glance. Colors show each person's most serious indicator right now."
      />
      <div className="grid gap-4 sm:grid-cols-3">
        {(["normal", "watch", "critical"] as const).map((s, i) => (
          <Surface key={s} className="flex items-center gap-4">
            <span
              className={cn(
                "inline-flex size-12 items-center justify-center rounded-2xl font-display text-2xl font-extrabold",
                STATUS_STYLE[s].soft,
                STATUS_STYLE[s].text,
              )}
            >
              {CREW.filter((a) => overallStatus(a.id) === s).length}
            </span>
            <div>
              <p className="font-semibold text-foreground">{STATUS_LABEL[s]}</p>
              <p className="text-xs text-muted-foreground">
                {["All indicators in range", "Needs follow-up", "Act now"][i]}
              </p>
            </div>
          </Surface>
        ))}
      </div>
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {CREW.map((a) => {
          const v = latest(a.id),
            s = overallStatus(a.id),
            env = ENVIRONMENTS[a.env],
            count = alerts.filter((x) => x.astronautId === a.id && x.state !== "resolved").length;
          return (
            <Surface
              key={a.id}
              className={cn("flex flex-col", s === "critical" && "ring-2 ring-destructive/30")}
            >
              <div className="flex items-start gap-3">
                <AstronautAvatar a={a} size="lg" ring={s} />
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-lg font-bold text-foreground">{a.name}</h3>
                  <p className="text-xs text-muted-foreground">
                    {a.role} · {a.agency}
                  </p>
                  <StatusPill
                    className="mt-2"
                    status={s}
                    label={`${STATUS_LABEL[s]}${count ? ` · ${count} alert${count === 1 ? "" : "s"}` : ""}`}
                  />
                </div>
              </div>
              <div className="my-4 rounded-2xl bg-muted p-3">
                <p className="text-sm font-semibold text-foreground">{env.name}</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {env.gravity} · delay {env.commDelay} · {a.missionName}
                </p>
                <div className="mt-3 flex items-center gap-3">
                  <Progress
                    className="h-1.5 flex-1"
                    value={(a.missionDay / a.missionLength) * 100}
                  />
                  <span className="text-xs font-semibold text-muted-foreground">
                    Day {a.missionDay}/{a.missionLength}
                  </span>
                </div>
              </div>
              <div className="mb-4 grid grid-cols-4 gap-2">
                {(["hr", "temp", "spo2", "sleep"] as const).map((k) => {
                  const Icon = METRIC_ICON[k],
                    st = statusOf(k, v[k]);
                  return (
                    <div
                      key={k}
                      className={cn(
                        "flex flex-col items-center gap-1 rounded-xl p-2",
                        STATUS_STYLE[st].soft,
                        STATUS_STYLE[st].text,
                      )}
                    >
                      <Icon className="size-4" />
                      <span className="font-display text-sm font-bold tabular">{v[k]}</span>
                    </div>
                  );
                })}
              </div>
              <Button
                variant="soft"
                className="mt-auto w-full"
                onClick={() => {
                  setAstronautId(a.id);
                  void navigate({ to: "/dashboard" });
                }}
              >
                Open {a.name.split(" ")[0]}'s dashboard <ArrowRight />
              </Button>
            </Surface>
          );
        })}
      </div>
      <section>
        <SectionHead title="Mission environments" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {Object.values(ENVIRONMENTS).map((e) => (
            <Surface key={e.id}>
              <h3 className="font-bold text-foreground">{e.short}</h3>
              <p className="mt-1 min-h-8 text-xs text-muted-foreground">{e.location}</p>
              <dl className="my-4 space-y-2 text-xs">
                {[
                  ["Gravity", e.gravity],
                  ["Radiation", `${e.radiation} mSv/d`],
                  ["Delay", e.commDelay],
                ].map(([k, v]) => (
                  <div className="flex justify-between gap-2" key={k}>
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="font-semibold text-foreground">{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="flex gap-1">
                {CREW.filter((a) => a.env === e.id).map((a) => (
                  <AstronautAvatar key={a.id} a={a} size="sm" />
                ))}
              </div>
            </Surface>
          ))}
        </div>
      </section>
    </div>
  );
}
