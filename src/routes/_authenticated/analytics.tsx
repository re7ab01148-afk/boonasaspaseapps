import { DemoOnly } from "@/components/boo/DemoOnly";
import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarDays, Download } from "lucide-react";
import { toast } from "sonner";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import { Button } from "@/components/ui/button";
import { ManualTag, PageHeader, SectionHead, Surface } from "@/components/boo/ui";
import { TrendChart, tooltipStyle } from "@/components/boo/charts";
import { METRIC_ICON } from "@/components/boo/metric-icons";
import { useAppState } from "@/lib/app-state";
import { HISTORY, fmtWeekday, fmtShortDate } from "@/lib/health/data";
import {
  METRICS,
  STATUS_STYLE,
  isManualMetric,
  statusOf,
  type MetricKey,
} from "@/lib/health/metrics";
import { cn } from "@/lib/utils";

const title = "Analytics · BOO Astronaut Health";
const description = "Explore astronaut health trends, healthy ranges and period summaries.";
export const Route = createFileRoute("/_authenticated/analytics")({
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
  component: AnalyticsPageGate,
});
const ranges = [
  { id: "1W", days: 7 },
  { id: "1M", days: 30 },
  { id: "3M", days: 90 },
  { id: "1Y", days: 365 },
];
const cards: MetricKey[] = ["hr", "temp", "spo2", "glucose", "sleep", "mood"];
const metrics: MetricKey[] = [
  "hr",
  "temp",
  "spo2",
  "sys",
  "dia",
  "glucose",
  "sleep",
  "mood",
  "iop",
  "hydration",
  "radiation",
];
const tick = { fontSize: 11, fill: "var(--muted-foreground)" };
const margin = { top: 8, right: 8, left: -18, bottom: 0 };
function AnalyticsPage() {
  const { astronaut } = useAppState();
  const [range, setRange] = useState("1M");
  const days = ranges.find((r) => r.id === range)?.days ?? 30;
  const data = useMemo(
    () =>
      HISTORY[astronaut.id]
        .slice(-days)
        .map((row) => ({ ...row, label: days <= 7 ? fmtWeekday(row.ts) : fmtShortDate(row.ts) })),
    [astronaut.id, days],
  );
  const summary = metrics.map((key) => {
    const values = data.map((row) => row[key]);
    const avg = values.reduce((sum, v) => sum + v, 0) / values.length;
    return {
      key,
      avg,
      min: Math.min(...values),
      max: Math.max(...values),
      inRange: values.filter((v) => statusOf(key, v) === "normal").length / values.length,
      status: statusOf(key, avg),
    };
  });
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Analytics"
        title="Health trends"
        description={`${data.length} days of readings for ${astronaut.name}. The green band on every chart is the healthy range.`}
        actions={
          <>
            <div className="flex rounded-full border border-border bg-card p-1 shadow-sm">
              {ranges.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  aria-pressed={range === r.id}
                  onClick={() => setRange(r.id)}
                  className={cn(
                    "rounded-full px-4 py-1.5 text-sm font-bold transition-all",
                    range === r.id
                      ? "bg-gradient-primary text-primary-foreground shadow-glow"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {r.id}
                </button>
              ))}
            </div>
            <Button
              variant="pill"
              onClick={() =>
                toast.success("Export ready", {
                  description: `${data.length * metrics.length} readings packaged as CSV for the flight surgeon.`,
                })
              }
            >
              <Download /> Export
            </Button>
          </>
        }
      />
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((key) => {
          const m = METRICS[key],
            value = data[data.length - 1][key],
            Icon = METRIC_ICON[key];
          return (
            <Surface key={key}>
              <div className="mb-3 flex items-center justify-between">
                <span className="flex items-center gap-2 font-semibold text-foreground">
                  <Icon className={cn("size-4", STATUS_STYLE[statusOf(key, value)].text)} />
                  {m.label}
                </span>
                <span className="font-display text-lg font-bold text-foreground tabular">
                  {value.toFixed(m.decimals)}{" "}
                  <span className="text-xs text-muted-foreground">{m.unit}</span>
                </span>
              </div>
              {isManualMetric(key) && <ManualTag className="-mt-1 mb-2" />}
              <TrendChart data={data} metric={key} xKey="label" height={190} />
            </Surface>
          );
        })}
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <Surface>
          <SectionHead
            icon={<CalendarDays />}
            title="Blood pressure"
            sub="Systolic & diastolic (mmHg)"
            action={<ManualTag />}
          />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={margin}>
                <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 4" />
                <ReferenceArea y1={90} y2={129} fill="var(--success)" fillOpacity={0.05} />
                <XAxis
                  dataKey="label"
                  tickLine={false}
                  axisLine={false}
                  tick={tick}
                  minTickGap={24}
                />
                <YAxis
                  domain={[50, 160]}
                  tickLine={false}
                  axisLine={false}
                  tick={tick}
                  width={46}
                />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line
                  type="monotone"
                  dataKey="sys"
                  name="Systolic"
                  stroke="var(--chart-1)"
                  strokeWidth={2.4}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="dia"
                  name="Diastolic"
                  stroke="var(--chart-5)"
                  strokeWidth={2.4}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Surface>
        <Surface>
          <SectionHead
            icon={<CalendarDays />}
            title="Sleep vs mood"
            sub="Each dot is one day — more sleep usually means better mood"
          />
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart margin={margin}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="4 4" />
                <XAxis
                  type="number"
                  dataKey="sleep"
                  name="Sleep"
                  unit=" h"
                  domain={[3, 10]}
                  tick={tick}
                />
                <YAxis
                  type="number"
                  dataKey="mood"
                  name="Mood"
                  domain={[1, 5]}
                  tick={tick}
                  width={46}
                />
                <ZAxis range={[40, 40]} />
                <Tooltip contentStyle={tooltipStyle} />
                <Scatter data={data} fill="var(--chart-6)" fillOpacity={0.6} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </Surface>
      </div>
      <Surface>
        <SectionHead
          icon={<CalendarDays />}
          title="Exercise & radiation"
          sub="Minutes of training per day and daily radiation dose"
        />
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={margin}>
              <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 4" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={tick}
                minTickGap={24}
              />
              <YAxis yAxisId="l" tickLine={false} axisLine={false} tick={tick} width={46} />
              <YAxis
                yAxisId="r"
                orientation="right"
                tickLine={false}
                axisLine={false}
                tick={tick}
                width={40}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar
                yAxisId="l"
                dataKey="exercise"
                name="Exercise (min)"
                fill="var(--chart-1)"
                radius={[6, 6, 0, 0]}
              />
              <Bar
                yAxisId="r"
                dataKey="radiation"
                name="Radiation (mSv)"
                fill="var(--chart-6)"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Surface>
      <Surface>
        <SectionHead
          title="Summary for this period"
          sub="Average, lowest, highest and time spent in the healthy range"
        />
        <div className="relative w-full overflow-x-auto">
          <table className="w-full caption-bottom text-sm">
            <thead>
              <tr className="border-b border-border">
                {["Indicator", "Average", "Lowest", "Highest", "Days in healthy range"].map(
                  (label, i) => (
                    <th
                      key={label}
                      className={cn(
                        "h-12 px-4 text-left align-middle font-medium text-muted-foreground",
                        i > 0 && i < 4 && "text-right",
                        i === 4 && "w-56",
                      )}
                    >
                      {label}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {summary.map((row) => {
                const m = METRICS[row.key];
                return (
                  <tr
                    key={row.key}
                    className="border-b border-border transition-colors hover:bg-muted/50"
                  >
                    <td className="p-4 align-middle font-semibold">
                      <span className="flex items-center gap-2">
                        <span className={cn("size-2 rounded-full", STATUS_STYLE[row.status].dot)} />
                        {m.label}
                      </span>
                    </td>
                    <td className="p-4 text-right align-middle tabular">
                      {row.avg.toFixed(m.decimals)} {m.unit}
                    </td>
                    <td className="p-4 text-right align-middle text-muted-foreground tabular">
                      {row.min.toFixed(m.decimals)}
                    </td>
                    <td className="p-4 text-right align-middle text-muted-foreground tabular">
                      {row.max.toFixed(m.decimals)}
                    </td>
                    <td className="p-4 align-middle">
                      <div className="flex items-center gap-2">
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                          <div
                            className={cn(
                              "h-full rounded-full",
                              row.inRange > 0.85
                                ? "bg-success"
                                : row.inRange > 0.6
                                  ? "bg-warning"
                                  : "bg-destructive",
                            )}
                            style={{ width: `${Math.round(row.inRange * 100)}%` }}
                          />
                        </div>
                        <span className="w-10 text-right text-xs font-semibold tabular">
                          {Math.round(row.inRange * 100)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Surface>
    </div>
  );
}

function AnalyticsPageGate() {
  return (
    <DemoOnly>
      <AnalyticsPage />
    </DemoOnly>
  );
}
