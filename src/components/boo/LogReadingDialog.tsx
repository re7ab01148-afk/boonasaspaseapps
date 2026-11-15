import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { METRICS, STATUS_STYLE, recommend, statusOf, type MetricKey } from "@/lib/health/metrics";
import { StatusPill } from "./ui";

const LOGGABLE: MetricKey[] = ["hr", "temp", "spo2", "sys", "dia", "glucose", "sleep", "mood", "iop", "hydration"];

export interface LoggedReading {
  metric: MetricKey;
  value: number;
}

export function LogReadingDialog({ onSave }: { onSave: (r: LoggedReading) => void }) {
  const [open, setOpen] = useState(false);
  const [metric, setMetric] = useState<MetricKey>("glucose");
  const [raw, setRaw] = useState("");
  const value = Number(raw);
  const valid = raw.trim() !== "" && Number.isFinite(value);
  const status = valid ? statusOf(metric, value) : null;
  const m = METRICS[metric];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="glow" size="xl">
          <Plus /> Log a reading
        </Button>
      </DialogTrigger>
      <DialogContent className="rounded-3xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">Log a health reading</DialogTitle>
          <DialogDescription>Type a value from any instrument. BOO checks it instantly against safe ranges.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label>Indicator</Label>
            <Select value={metric} onValueChange={(v) => setMetric(v as MetricKey)}>
              <SelectTrigger className="h-11 rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LOGGABLE.map((k) => (
                  <SelectItem key={k} value={k}>
                    {METRICS[k].label} ({METRICS[k].unit})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="reading">Value</Label>
            <div className="relative">
              <Input
                id="reading"
                inputMode="decimal"
                value={raw}
                onChange={(e) => setRaw(e.target.value)}
                placeholder={`e.g. ${m.normal[0]}`}
                className="h-12 rounded-xl pr-16 font-display text-lg"
              />
              <span className="absolute top-1/2 right-4 -translate-y-1/2 text-sm font-semibold text-muted-foreground">{m.unit}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Healthy range: {m.normal[0]}–{m.normal[1]} {m.unit}
            </p>
          </div>
          {status && (
            <div className={cn("rounded-2xl border p-4", STATUS_STYLE[status].pill)}>
              <StatusPill status={status} />
              <p className="mt-2 text-sm font-medium text-foreground">{recommend(metric, status)}</p>
            </div>
          )}
          <Button
            variant={status === "critical" ? "alert" : "glow"}
            size="xl"
            disabled={!valid}
            onClick={() => {
              onSave({ metric, value });
              toast.success(`${m.label} saved`, { description: `${value} ${m.unit} · ${status ? status.toUpperCase() : ""}` });
              setRaw("");
              setOpen(false);
            }}
          >
            Save reading
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
