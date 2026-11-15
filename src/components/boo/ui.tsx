import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  MANUAL_NOTE,
  METRICS,
  STATUS_LABEL,
  STATUS_STYLE,
  improved,
  type MetricKey,
  type Status,
} from "@/lib/health/metrics";
import type { Astronaut } from "@/lib/health/data";

const AVATAR_BG: Record<Astronaut["color"], string> = {
  "chart-1": "bg-chart-1",
  "chart-2": "bg-chart-2",
  "chart-3": "bg-chart-3",
  "chart-4": "bg-chart-4",
  "chart-5": "bg-chart-5",
  "chart-6": "bg-chart-6",
};

export function StatusPill({
  status,
  label,
  className,
}: {
  status: Status;
  label?: string | undefined;
  className?: string | undefined;
}) {
  const s = STATUS_STYLE[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold",
        s.pill,
        className,
      )}
    >
      <span className={cn("size-1.5 rounded-full", s.dot)} />
      {label ?? STATUS_LABEL[status]}
    </span>
  );
}

export function AstronautAvatar({
  a,
  size = "md",
  ring,
}: {
  a: Astronaut;
  size?: "sm" | "md" | "lg" | undefined;
  ring?: Status | undefined;
}) {
  const dims =
    size === "sm" ? "size-8 text-xs" : size === "lg" ? "size-16 text-xl" : "size-11 text-sm";
  return (
    <span className="relative inline-flex shrink-0">
      <span
        className={cn(
          "inline-flex items-center justify-center rounded-full font-display font-bold text-primary-foreground",
          AVATAR_BG[a.color],
          dims,
        )}
      >
        {a.initials}
      </span>
      {ring && (
        <span
          className={cn(
            "absolute -right-0.5 -bottom-0.5 size-3 rounded-full border-2 border-card",
            STATUS_STYLE[ring].dot,
          )}
        />
      )}
    </span>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string | undefined;
  title: ReactNode;
  description?: ReactNode | undefined;
  actions?: ReactNode | undefined;
}) {
  return (
    <div className="flex flex-col gap-4 pb-6 md:flex-row md:items-end md:justify-between">
      <div>
        {eyebrow && (
          <p className="mb-1 text-xs font-bold tracking-[0.18em] text-primary uppercase">
            {eyebrow}
          </p>
        )}
        <h1 className="text-3xl font-bold text-foreground md:text-4xl">{title}</h1>
        {description && (
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

export function Surface({ className, children }: { className?: string | undefined; children: ReactNode }) {
  return <div className={cn("surface p-5", className)}>{children}</div>;
}

export function SectionHead({
  icon,
  title,
  action,
  sub,
}: {
  icon?: ReactNode | undefined;
  title: ReactNode;
  action?: ReactNode | undefined;
  sub?: ReactNode | undefined;
}) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <div className="flex items-center gap-2.5">
        {icon && (
          <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground [&_svg]:size-4">
            {icon}
          </span>
        )}
        <div>
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
        </div>
      </div>
      {action}
    </div>
  );
}

export function Ring({
  value,
  max = 100,
  size = 200,
  stroke = 14,
  status,
  children,
  className,
}: {
  value: number;
  max?: number | undefined;
  size?: number | undefined;
  stroke?: number | undefined;
  status?: Status | undefined;
  children?: ReactNode | undefined;
  className?: string | undefined;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(1, value / max));
  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="stroke-muted"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          className={cn(
            "transition-all duration-1000",
            status ? STATUS_STYLE[status].ring : "stroke-primary",
          )}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  );
}

/** Change vs a previous value; green when it moved toward the healthy range. */
export function Delta({
  now,
  prev,
  unit,
  metric,
}: {
  now: number;
  prev: number;
  unit?: string | undefined;
  metric?: MetricKey | undefined;
}) {
  const decimals = metric ? METRICS[metric].decimals : 1;
  const p = 10 ** Math.max(1, decimals);
  const d = Math.round((now - prev) * p) / p;
  const Icon = d > 0 ? ArrowUpRight : d < 0 ? ArrowDownRight : Minus;
  const good = d === 0 ? null : metric ? improved(metric, now, prev) : d > 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 text-xs font-semibold tabular",
        good === null
          ? "text-muted-foreground"
          : good
            ? "text-success"
            : metric
              ? "text-warning-foreground"
              : "text-muted-foreground",
      )}
      dir="ltr"
    >
      <Icon className="size-3.5" />
      {d > 0 ? "+" : d < 0 ? "−" : "±"}
      {Math.abs(d)}
      {unit}
    </span>
  );
}

/** Small tag for readings the helmet doesn't measure automatically yet. */
export function ManualTag({ className }: { className?: string | undefined }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full bg-accent px-2 py-0.5 text-[10px] leading-tight font-bold text-accent-foreground",
        className,
      )}
    >
      {MANUAL_NOTE}
    </span>
  );
}
