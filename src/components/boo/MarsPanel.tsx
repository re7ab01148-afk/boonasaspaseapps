import { useEffect, useState } from "react";
import { Orbit, ShieldAlert, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { STATUS_STYLE, type MetricKey, type Status } from "@/lib/health/metrics";
import { marsSteps } from "@/lib/health/mars";
import { fmtTime } from "@/lib/health/data";
import { SectionHead, Surface } from "./ui";

export interface MarsAlert {
  id: string;
  metric: MetricKey;
  severity: Status;
  title: string;
  recommendation: string;
}

export function MarsPanel({ alerts }: { alerts: MarsAlert[] }) {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);
  const top = alerts.slice(0, 2);
  return (
    <Surface className="border-primary/30 bg-gradient-sky">
      <SectionHead icon={<Orbit />} title="Mars Mode · autonomous care" sub="20-minute one-way signal delay to Earth" />
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          ["Message sent now reaches Earth", now ? `${fmtTime(now + 1_200_000)} UTC` : "–"],
          ["Earliest reply", now ? `${fmtTime(now + 2_400_000)} UTC` : "–"],
          ["Decision support", "On board"],
        ].map(([k, v]) => (
          <div key={k} className="rounded-2xl bg-card p-3 ring-1 ring-border">
            <p className="text-xs font-semibold text-muted-foreground">{k}</p>
            <p className="font-display text-lg font-bold text-foreground tabular">{v}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 space-y-3">
        {top.length === 0 ? (
          <p className="flex items-center gap-2 rounded-2xl bg-card p-3 text-sm text-muted-foreground ring-1 ring-border">
            <ShieldCheck className="size-4 text-success" /> No active alerts. The on-board system keeps watching your readings.
          </p>
        ) : (
          top.map((a) => (
            <div
              key={a.id}
              className={cn("rounded-2xl border bg-card p-3", a.severity === "critical" ? "border-destructive/40" : "border-warning/50")}
            >
              <p className={cn("flex items-center gap-1.5 text-sm font-bold", STATUS_STYLE[a.severity].text)}>
                <ShieldAlert className="size-4" /> {a.title}
              </p>
              <ol className="mt-1.5 list-decimal space-y-1 ps-5 text-xs text-muted-foreground">
                {marsSteps(a.metric, a.severity, a.recommendation).map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ol>
            </div>
          ))
        )}
      </div>
    </Surface>
  );
}
