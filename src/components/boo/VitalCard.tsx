import { cn } from "@/lib/utils";
import {
  METRICS,
  STATUS_STYLE,
  formatValue,
  isManualMetric,
  statusOf,
  type MetricKey,
} from "@/lib/health/metrics";
import { Sparkline } from "./charts";
import { METRIC_ICON } from "./metric-icons";
import { Delta, ManualTag, StatusPill } from "./ui";

export function VitalCard({
  metric,
  value,
  prev,
  history,
  display,
  onClick,
  compareLabel = "vs yesterday",
  goal,
}: {
  metric: MetricKey;
  value: number;
  prev: number;
  history: number[];
  display?: string;
  onClick?: () => void;
  compareLabel?: string;
  goal?: number;
}) {
  const m = METRICS[metric];
  const status = statusOf(metric, value);
  const Icon = METRIC_ICON[metric];
  const color = `var(--${status === "normal" ? m.chart : status === "watch" ? "warning" : "destructive"})`;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "surface group flex flex-col gap-3 p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-float",
        status === "critical" && "ring-2 ring-destructive/40",
      )}
    >
      <div className="flex items-center justify-between gap-1">
        <span
          className={cn(
            "inline-flex size-9 shrink-0 items-center justify-center rounded-xl",
            STATUS_STYLE[status].soft,
          )}
        >
          <Icon className={cn("size-[18px]", STATUS_STYLE[status].text)} />
        </span>
        <StatusPill status={status} />
      </div>
      <div>
        <p className="text-xs font-semibold text-muted-foreground">{m.label}</p>
        <p className="mt-0.5 flex flex-wrap items-baseline gap-1 font-display text-2xl font-bold text-foreground tabular">
          {display ?? formatValue(metric, value)}
          <span className="text-sm font-semibold text-muted-foreground">{m.unit}</span>
        </p>
        {isManualMetric(metric) && <ManualTag className="mt-1.5" />}
      </div>
      {goal !== undefined && (
        <div>
          <div
            className="h-2 overflow-hidden rounded-full bg-muted"
            role="progressbar"
            aria-valuenow={Math.round((value / goal) * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Daily water goal"
          >
            <div
              className={cn(
                "h-full rounded-full transition-[width] duration-1000",
                value >= goal ? "bg-success" : STATUS_STYLE[status].dot,
              )}
              style={{ width: `${Math.min(100, (value / goal) * 100)}%` }}
            />
          </div>
          <p className="mt-1 text-[11px] font-semibold text-muted-foreground">
            {Math.min(100, Math.round((value / goal) * 100))}% of {goal} L daily goal
          </p>
        </div>
      )}
      <Sparkline data={history} color={color} />
      <div className="flex items-center justify-between gap-1 text-xs text-muted-foreground">
        <span>{compareLabel}</span>
        <Delta now={value} prev={prev} metric={metric} />
      </div>
    </button>
  );
}
