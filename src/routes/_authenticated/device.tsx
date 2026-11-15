import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  BatteryCharging,
  Bell,
  Bluetooth,
  CircleCheck,
  Cpu,
  Download,
  HardDrive,
  Moon,
  RefreshCw,
  Ruler,
  Unplug,
  Vibrate,
  Clock,
} from "lucide-react";
import { toast } from "sonner";
import helmet from "@/assets/boo-helmet.png";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import { PageHeader, Ring, SectionHead, Surface } from "@/components/boo/ui";
import { DEVICE, timeAgo } from "@/lib/health/data";
import { cn } from "@/lib/utils";
export const Route = createFileRoute("/_authenticated/device")({
  head: () => ({
    meta: [
      { title: "Device · BOO Astronaut Health" },
      { name: "description", content: "BOO Band S2 battery, sensors and settings." },
      { property: "og:title", content: "Device · BOO Astronaut Health" },
      { property: "og:description", content: "BOO Band S2 battery, sensors and settings." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Device,
});
function Device() {
  const [connected, setConnected] = useState(true);
  const [settings, setSettings] = useState({
    notifications: true,
    haptic: true,
    reminders: true,
    sleepMode: false,
  });
  const tiles = [
    { icon: Bluetooth, label: "Connection type", value: DEVICE.connection },
    { icon: Cpu, label: "Firmware version", value: DEVICE.firmware },
    { icon: RefreshCw, label: "Update status", value: "Up to date", ok: true },
    { icon: HardDrive, label: "Serial number", value: DEVICE.serial },
  ];
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Device"
        title="BOO Band S2"
        description="Your wrist sensor records heart rate, oxygen, temperature, blood pressure, movement and radiation."
      />
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <Surface className="flex flex-col items-center bg-gradient-sky text-center">
          <img
            src={helmet}
            alt="BOO"
            width={1024}
            height={1024}
            className="size-24 animate-float object-contain"
          />
          <p className="mt-2 font-display text-lg font-bold text-foreground">BOO Device</p>
          <p
            className={cn(
              "flex items-center gap-1.5 text-sm font-semibold",
              connected ? "text-success" : "text-muted-foreground",
            )}
          >
            <span
              className={cn(
                "size-2 rounded-full",
                connected ? "bg-success" : "bg-muted-foreground",
              )}
            />
            {connected ? "Online" : "Disconnected"}
          </p>
          <Ring value={DEVICE.battery} size={190} stroke={14} className="mt-6">
            <BatteryCharging className="size-7 text-success" />
            <span className="font-display text-5xl font-extrabold text-foreground">
              {DEVICE.battery}%
            </span>
            <span className="text-xs font-semibold text-muted-foreground">Battery · ~3 days</span>
          </Ring>
          <div className="mt-6 flex w-full items-center gap-3 rounded-2xl bg-accent p-4 text-left">
            <CircleCheck className="size-6 shrink-0 text-primary" />
            <p className="text-sm font-semibold text-accent-foreground">
              {connected ? "Your device is working perfectly!" : "Reconnect to resume monitoring."}
            </p>
          </div>
        </Surface>
        <div className="space-y-6">
          <Surface>
            <SectionHead title="Device info" sub={`Last sync ${timeAgo(DEVICE.lastSync)}`} />
            <div className="grid gap-3 sm:grid-cols-2">
              {tiles.map((t) => (
                <div key={t.label} className="flex items-center gap-3 rounded-2xl bg-muted p-4">
                  <t.icon className="size-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground">{t.label}</p>
                    <p
                      className={cn("text-sm font-bold", t.ok ? "text-success" : "text-foreground")}
                    >
                      {t.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4">
              <div className="mb-1.5 flex justify-between text-xs font-semibold text-muted-foreground">
                <span>On-device storage</span>
                <span>
                  {DEVICE.storage.used} / {DEVICE.storage.total} GB
                </span>
              </div>
              <Progress
                value={(DEVICE.storage.used / DEVICE.storage.total) * 100}
                className="h-2"
              />
            </div>
          </Surface>
          <Surface>
            <SectionHead title="Sensors" sub="Self-test passed 06:02 MT" />
            <ul className="divide-y divide-border">
              {DEVICE.sensors.map((s) => (
                <li key={s.name} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <span className="font-semibold text-foreground">{s.name}</span>
                  <span className="flex shrink-0 items-center gap-3">
                    <span className="hidden text-xs text-muted-foreground sm:inline">
                      {s.accuracy}
                    </span>
                    <span
                      className={cn(
                        "rounded-full px-2 py-0.5 text-xs font-bold",
                        s.status === "OK"
                          ? "bg-success/10 text-success"
                          : "bg-warning/10 text-warning-foreground",
                      )}
                    >
                      {s.status}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          </Surface>
        </div>
      </div>
      <Surface>
        <SectionHead title="Settings" />
        <div className="divide-y divide-border">
          {(
            [
              {
                key: "notifications",
                icon: Bell,
                label: "Notifications",
                sub: "Alerts for abnormal vitals",
              },
              {
                key: "haptic",
                icon: Vibrate,
                label: "Haptic alerts",
                sub: "Vibrate the band on critical alerts",
              },
              {
                key: "reminders",
                icon: Clock,
                label: "Measurement reminders",
                sub: "Nudge me at each scheduled check-in",
              },
              {
                key: "sleepMode",
                icon: Moon,
                label: "Sleep mode",
                sub: "Silence non-critical alerts during rest",
              },
            ] as const
          ).map((s) => (
            <label key={s.key} className="flex cursor-pointer items-center gap-3 py-3.5">
              <s.icon className="size-5 text-muted-foreground" />
              <span className="flex-1">
                <span className="block text-sm font-semibold text-foreground">{s.label}</span>
                <span className="block text-xs text-muted-foreground">{s.sub}</span>
              </span>
              <Switch
                checked={settings[s.key]}
                onCheckedChange={(checked) => setSettings((v) => ({ ...v, [s.key]: checked }))}
              />
            </label>
          ))}
          <div className="flex items-center gap-3 py-3.5">
            <Ruler className="size-5 text-muted-foreground" />
            <span className="flex-1 text-sm font-semibold text-foreground">Units</span>
            <span className="text-sm text-muted-foreground">Metric (°C, bpm, mg/dL)</span>
          </div>
        </div>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <Button
            variant="soft"
            className="flex-1"
            onClick={() =>
              toast.success("Export started", {
                description: "365 days of data packaged for the flight surgeon.",
              })
            }
          >
            <Download />
            Export data
          </Button>
          <Button
            variant="outline"
            className={cn(
              "flex-1 rounded-xl",
              connected &&
                "border-destructive/30 bg-destructive/5 text-destructive hover:bg-destructive/10",
            )}
            onClick={() => {
              setConnected((v) => !v);
              toast(connected ? "Device disconnected" : "Device reconnected");
            }}
          >
            <Unplug />
            {connected ? "Disconnect device" : "Reconnect device"}
          </Button>
        </div>
      </Surface>
    </div>
  );
}
