import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { BellRing, Check, Siren, TriangleAlert } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { AstronautAvatar, PageHeader, StatusPill, Surface } from "@/components/boo/ui";
import { METRIC_ICON } from "@/components/boo/metric-icons";
import { useAppState } from "@/lib/app-state";
import { fmtShortDate, fmtTime, getAstronaut, timeAgo, type AlertState } from "@/lib/health/data";
import { STATUS_STYLE } from "@/lib/health/metrics";
import { marsSteps } from "@/lib/health/mars";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";
import { PersonalAlerts } from "@/components/boo/personal/PersonalAlerts";
export const Route = createFileRoute("/_authenticated/alerts")({
  head: () => ({
    meta: [
      { title: "Alerts · BOO Astronaut Health" },
      { name: "description", content: "Crew health alerts and recommended actions." },
      { property: "og:title", content: "Alerts · BOO Astronaut Health" },
      { property: "og:description", content: "Crew health alerts and recommended actions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AlertsPage,
});
function AlertsPage() {
  const { isDemo } = useAuth();
  return isDemo ? <Alerts /> : <PersonalAlerts />;
}
function Alerts() {
  const { alerts, setAlertState, marsMode } = useAppState();
  const [filter, setFilter] = useState<AlertState | "all">("all");
  const featured =
    alerts.find((a) => a.state === "open" && a.severity === "critical") ??
    alerts.find((a) => a.state === "open");
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Alerts"
        title="Health alerts"
        description={`${alerts.filter((a) => a.state !== "resolved").length} need attention: ${alerts.filter((a) => a.state === "open").length} open · ${alerts.filter((a) => a.state === "acknowledged").length} in progress · ${alerts.filter((a) => a.state === "resolved").length} resolved in the last 90 days.`}
      />
      {featured && (
        <section className="grid overflow-hidden rounded-[2rem] bg-card shadow-danger ring-1 ring-destructive/20 lg:grid-cols-[1fr_1.2fr]">
          <div className="relative flex flex-col items-center justify-center gap-3 bg-destructive/5 p-8 text-center">
            <span className="absolute size-40 animate-pulse-ring rounded-full bg-destructive/15" />
            <span className="relative inline-flex size-24 items-center justify-center rounded-3xl bg-gradient-danger shadow-danger">
              <TriangleAlert className="size-12 text-destructive-foreground" />
            </span>
            <h2 className="relative mt-2 text-4xl font-extrabold text-destructive">Alert!</h2>
            <p className="relative font-display text-lg font-semibold text-foreground">
              Abnormal vital detected
            </p>
            <div className="relative mt-2 rounded-2xl bg-destructive/10 px-6 py-3">
              <p className="font-display text-4xl font-extrabold text-destructive tabular">
                {featured.value}
              </p>
              <p className="text-sm font-semibold text-foreground">{featured.title}</p>
            </div>
          </div>
          <div className="flex flex-col p-6 md:p-8">
            <div className="flex items-center gap-3">
              <AstronautAvatar a={getAstronaut(featured.astronautId)} />
              <div>
                <p className="font-semibold text-foreground">
                  {getAstronaut(featured.astronautId).name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {featured.id} · {timeAgo(featured.ts)}
                </p>
              </div>
              <StatusPill status={featured.severity} className="ml-auto" />
            </div>
            <p className="mt-5 text-foreground">{featured.message}</p>
            <div className="mt-4 rounded-2xl border border-border bg-muted p-4">
              <p className="text-xs font-bold text-primary uppercase">Recommended action</p>
              <p className="mt-1 text-sm text-foreground">{featured.action}</p>
            </div>
            {marsMode && (
              <div className="mt-4 rounded-2xl bg-accent p-4">
                <p className="text-sm font-bold text-accent-foreground">Autonomous on-board plan</p>
                <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm text-muted-foreground">
                  {marsSteps(featured.metric, featured.severity, featured.action).map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ol>
              </div>
            )}
            <div className="mt-auto flex flex-col gap-3 pt-6 sm:flex-row">
              <Button
                variant="alert"
                size="xl"
                className="flex-1"
                onClick={() => {
                  setAlertState(featured.id, "acknowledged");
                  toast.success("Action started", {
                    description: marsMode
                      ? "On-board plan started. The crew medical officer leads care."
                      : "Flight surgeon notified. Medical conference opening on channel 2.",
                  });
                }}
              >
                <Siren /> Take action
              </Button>
              <Button
                variant="pill"
                size="xl"
                className="flex-1"
                onClick={() => {
                  setAlertState(featured.id, "resolved");
                  toast("Alert dismissed", {
                    description: "BOO will keep monitoring this indicator.",
                  });
                }}
              >
                Dismiss
              </Button>
            </div>
          </div>
        </section>
      )}
      <Surface>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 font-semibold text-foreground">
            <BellRing className="size-4 text-primary" />
            Alert log
          </h3>
          <div className="flex rounded-full border border-border bg-muted p-1">
            {(["all", "open", "acknowledged", "resolved"] as const).map((id, i) => (
              <button
                type="button"
                key={id}
                onClick={() => setFilter(id)}
                aria-pressed={filter === id}
                className={cn(
                  "rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors",
                  filter === id
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {["All", "Open", "In progress", "Resolved"][i]}
              </button>
            ))}
          </div>
        </div>
        <ul className="divide-y divide-border">
          {alerts
            .filter((a) => filter === "all" || a.state === filter)
            .map((a) => {
              const Icon = METRIC_ICON[a.metric];
              return (
                <li key={a.id} className="flex flex-col gap-3 py-4 md:flex-row md:items-center">
                  <div className="flex flex-1 items-start gap-3">
                    <span
                      className={cn(
                        "inline-flex size-11 shrink-0 items-center justify-center rounded-2xl",
                        STATUS_STYLE[a.severity].soft,
                      )}
                    >
                      <Icon className={cn("size-5", STATUS_STYLE[a.severity].text)} />
                    </span>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground">
                        {a.title}{" "}
                        <span
                          className={cn("ml-1 font-display tabular", STATUS_STYLE[a.severity].text)}
                        >
                          {a.value}
                        </span>
                      </p>
                      <p className="text-sm text-muted-foreground">{a.message}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {getAstronaut(a.astronautId).name} · {fmtShortDate(a.ts)} {fmtTime(a.ts)} ·{" "}
                        {a.id}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 md:justify-end">
                    {a.state === "resolved" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-3 py-1 text-xs font-bold text-success">
                        <Check className="size-3.5" />
                        Resolved
                      </span>
                    ) : (
                      <>
                        {a.state === "acknowledged" ? (
                          <span className="rounded-full bg-accent px-3 py-1 text-xs font-bold text-accent-foreground">
                            In progress
                          </span>
                        ) : (
                          <Button
                            size="sm"
                            variant="soft"
                            onClick={() => setAlertState(a.id, "acknowledged")}
                          >
                            Acknowledge
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="pill"
                          onClick={() => setAlertState(a.id, "resolved")}
                        >
                          Resolve
                        </Button>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
        </ul>
      </Surface>
    </div>
  );
}
