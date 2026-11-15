import { useEffect, useRef, useState } from "react";
import { Line, LineChart, ResponsiveContainer, YAxis } from "recharts";
import { HeartPulse, Play, RotateCcw, ShieldAlert, Siren, Wind } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { STATUS_STYLE, recommend, statusOf } from "@/lib/health/metrics";
import { marsSteps } from "@/lib/health/mars";
import { useAppState } from "@/lib/app-state";

const STEPS = 24;
const TICK_MS = 450;

function sample(i: number) {
  const t = Math.min(1, i / 20);
  const e = t * t * (3 - 2 * t);
  return { i, hr: Math.round(74 + e * 68 + (i % 2 ? 2 : -1)), spo2: Math.round(98 - e * 10) };
}
const CRITICAL_AT = Array.from({ length: 25 }, (_, i) => sample(i)).findIndex(
  (s) => statusOf("hr", s.hr) === "critical" || statusOf("spo2", s.spo2) === "critical",
);

export function EmergencySimulator({ size = "xl" }: { size?: "xl" | "default" }) {
  const { marsMode } = useAppState();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [running, setRunning] = useState(false);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stop = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    setRunning(false);
  };
  const start = () => {
    stop();
    setStep(0);
    setRunning(true);
    timer.current = setInterval(() => {
      setStep((s) => {
        if (s >= STEPS) {
          stop();
          return s;
        }
        return s + 1;
      });
    }, TICK_MS);
  };
  useEffect(() => () => stop(), []);
  useEffect(() => {
    if (open) start();
    else stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const series = Array.from({ length: step + 1 }, (_, i) => sample(i));
  const cur = series[series.length - 1];
  const hrS = statusOf("hr", cur.hr);
  const spS = statusOf("spo2", cur.spo2);
  const showAlert = step >= CRITICAL_AT;
  const showAction = step >= CRITICAL_AT + 3;
  const action = recommend("spo2", "critical");

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="alert" size={size}>
          <Siren /> Simulate emergency
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[94vh] overflow-y-auto rounded-3xl sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Emergency simulation</DialogTitle>
          <DialogDescription>
            A scripted live scenario: a rapid drop in blood oxygen during exercise. No data is
            saved.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            {
              icon: HeartPulse,
              label: "Heart rate",
              v: cur.hr,
              unit: "bpm",
              s: hrS,
              key: "hr" as const,
            },
            {
              icon: Wind,
              label: "Blood oxygen (SpO₂)",
              v: cur.spo2,
              unit: "%",
              s: spS,
              key: "spo2" as const,
            },
          ].map((c) => (
            <div
              key={c.key}
              className={cn(
                "rounded-2xl border p-4 transition-colors duration-500",
                STATUS_STYLE[c.s].pill,
              )}
            >
              <p className="flex items-center gap-1.5 text-xs font-bold">
                <c.icon className={cn("size-4", c.key === "hr" && "animate-heartbeat")} /> {c.label}
              </p>
              <p className="mt-1 font-display text-4xl font-extrabold text-foreground tabular">
                {c.v}
                <span className="ms-1 text-base text-muted-foreground">{c.unit}</span>
              </p>
              <div className="mt-2 h-14" dir="ltr">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={series}>
                    <YAxis hide domain={c.key === "hr" ? [60, 150] : [85, 100]} />
                    <Line
                      type="monotone"
                      dataKey={c.key}
                      dot={false}
                      strokeWidth={2.4}
                      isAnimationActive={false}
                      stroke={`var(--${c.s === "normal" ? "primary" : c.s === "watch" ? "warning" : "destructive"})`}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          ))}
        </div>
        <div
          className={cn(
            "grid transition-all duration-500",
            showAlert ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
          )}
        >
          <div className="overflow-hidden">
            <div className="rounded-2xl bg-gradient-danger p-4 text-destructive-foreground shadow-danger">
              <p className="flex items-center gap-2 font-display text-lg font-bold">
                <Siren className="size-5 animate-pulse" /> Critical · Low blood oxygen
              </p>
              <p className="text-sm opacity-90">
                SpO₂ {cur.spo2} % with heart rate {cur.hr} bpm
              </p>
            </div>
          </div>
        </div>
        <div
          className={cn(
            "grid transition-all duration-500",
            showAction ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
          )}
        >
          <div className="overflow-hidden">
            <div className="rounded-2xl border border-border bg-card p-4">
              <p className="text-xs font-bold text-muted-foreground uppercase">
                Recommended action
              </p>
              <p className="mt-1 font-semibold text-foreground">{action}</p>
              {marsMode && (
                <>
                  <p className="mt-3 flex items-center gap-1.5 text-xs font-bold text-primary">
                    <ShieldAlert className="size-3.5" /> Autonomous on-board plan
                  </p>
                  <ol className="mt-1 list-decimal space-y-1 ps-5 text-sm text-muted-foreground">
                    {marsSteps("spo2", "critical", action).map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ol>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-gradient-primary transition-all"
              style={{ width: `${(step / STEPS) * 100}%` }}
            />
          </div>
          <Button variant="pill" size="sm" onClick={start} disabled={running}>
            {step >= STEPS ? <RotateCcw /> : <Play />} {step >= STEPS ? "Replay" : "Running…"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
