import { Candy, Droplets, Eye, Gauge, HeartPulse, Moon, Radiation, Smile, Thermometer, Wind, type LucideIcon } from "lucide-react";
import type { MetricKey } from "@/lib/health/metrics";

export const METRIC_ICON: Record<MetricKey, LucideIcon> = {
  hr: HeartPulse,
  temp: Thermometer,
  spo2: Wind,
  sys: Gauge,
  dia: Gauge,
  glucose: Candy,
  sleep: Moon,
  mood: Smile,
  iop: Eye,
  hydration: Droplets,
  radiation: Radiation,
};
