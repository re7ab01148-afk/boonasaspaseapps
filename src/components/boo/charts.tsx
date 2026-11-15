import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { METRICS, type MetricKey } from "@/lib/health/metrics";

export const tooltipStyle = {
  background: "var(--card)",
  border: "1px solid var(--border)",
  borderRadius: 14,
  boxShadow: "var(--shadow-card)",
  fontSize: 12,
  color: "var(--foreground)",
};

export function Sparkline({
  data,
  color,
  height = 44,
}: {
  data: number[];
  color: string;
  height?: number | undefined;
}) {
  const rows = data.map((v, i) => ({ i, v }));
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ top: 4, right: 2, bottom: 4, left: 2 }}>
          <YAxis hide domain={["dataMin - 1", "dataMax + 1"]} />
          <Line
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={2.2}
            dot={false}
            animationDuration={900}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Area chart of one metric with the healthy range shaded green. */
export function TrendChart<T extends object>({
  data,
  metric,
  xKey,
  height = 220,
  color,
  showBand = true,
  domain,
}: {
  data: T[];
  metric: MetricKey;
  xKey: keyof T & string;
  height?: number | undefined;
  color?: string | undefined;
  showBand?: boolean | undefined;
  domain?: [number, number] | undefined;
}) {
  const m = METRICS[metric];
  const stroke = color ?? `var(--${m.chart})`;
  const id = `grad-${metric}-${xKey}`;
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
          <defs>
            <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity={0.32} />
              <stop offset="100%" stopColor={stroke} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="4 4" />
          {showBand && (
            <ReferenceArea
              y1={m.normal[0]}
              y2={Math.min(m.normal[1], (domain ?? m.axis)[1])}
              fill="var(--success)"
              fillOpacity={0.06}
            />
          )}
          <XAxis
            dataKey={xKey}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            minTickGap={24}
          />
          <YAxis
            domain={domain ?? m.axis}
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
            width={46}
          />
          <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} ${m.unit}`, m.label]} />
          <Area
            type="monotone"
            dataKey={metric}
            stroke={stroke}
            strokeWidth={2.4}
            fill={`url(#${id})`}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 2, stroke: "var(--card)" }}
            animationDuration={1100}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
