import { Check, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { METRICS, STATUS_STYLE } from "@/lib/health/metrics";
import { alertsFromReadings, useAcknowledgeReading, useMyReadings } from "@/lib/readings";
import { METRIC_ICON } from "@/components/boo/metric-icons";
import { PageHeader, StatusPill, Surface } from "@/components/boo/ui";

const fmtWhen = (iso: string) =>
  new Date(iso).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false });

export function PersonalAlerts() {
  const q = useMyReadings();
  const ack = useAcknowledgeReading();
  const alerts = alertsFromReadings(q.data ?? []);
  const open = alerts.filter((a) => !a.reading.acknowledged);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="My alerts"
        title="Health alerts"
        description={`${open.length} need attention · ${alerts.length - open.length} acknowledged. Alerts come from readings outside the healthy range.`}
      />
      <Surface>
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <ShieldCheck className="size-10 text-success" />
            <p className="font-display text-xl font-bold text-foreground">No alerts</p>
            <p className="text-sm text-muted-foreground">
              {(q.data ?? []).length === 0 ? "No data yet. Log a reading from your dashboard." : "All your readings are in the healthy range."}
            </p>
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {alerts.map((a) => {
              const m = METRICS[a.reading.metric];
              const Icon = METRIC_ICON[a.reading.metric];
              return (
                <li key={a.reading.id} className="flex flex-wrap items-start gap-4 py-4">
                  <span className={cn("inline-flex size-11 shrink-0 items-center justify-center rounded-2xl", STATUS_STYLE[a.status].soft)}>
                    <Icon className={cn("size-5", STATUS_STYLE[a.status].text)} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground">
                      {m.label}{" "}
                      <span className={cn("font-display font-bold", STATUS_STYLE[a.status].text)}>
                        {a.reading.value} {m.unit}
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground">{a.advice}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{fmtWhen(a.reading.recorded_at)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusPill status={a.status} />
                    {a.reading.acknowledged ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2.5 py-1 text-xs font-bold text-success">
                        <Check className="size-3.5" /> Acknowledged
                      </span>
                    ) : (
                      <Button
                        variant="soft"
                        size="sm"
                        disabled={ack.isPending}
                        onClick={() =>
                          ack.mutate(a.reading.id, {
                            onSuccess: () => toast.success("Alert acknowledged"),
                            onError: (e) => toast.error("Couldn't update alert", { description: e.message }),
                          })
                        }
                      >
                        Acknowledge
                      </Button>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </Surface>
    </div>
  );
}
