import { describe, expect, it } from "vitest";
import { levelFromXp, statusOf } from "@/lib/health/metrics";
import { overallStatus } from "@/lib/health/data";

describe("health status ranges", () => {
  it("heart rate 55–95 bpm is normal, 45–110 is watch, outside is critical", () => {
    expect(statusOf("hr", 68)).toBe("normal");
    expect(statusOf("hr", 104)).toBe("watch");
    expect(statusOf("hr", 120)).toBe("critical");
  });
  it("blood oxygen below 92 % is critical", () => {
    expect(statusOf("spo2", 93)).toBe("watch");
    expect(statusOf("spo2", 91)).toBe("critical");
  });
  it("body temperature 38.5 °C is critical", () => {
    expect(statusOf("temp", 38.5)).toBe("critical");
  });
});

describe("XP levels", () => {
  it("every 1000 XP is one level", () => {
    expect(levelFromXp(14490)).toEqual({ level: 15, into: 490, pct: 49 });
  });
});

describe("demo crew", () => {
  it("Rehab is all normal and Omar has a critical reading", () => {
    expect(overallStatus("rehab")).toBe("normal");
    expect(overallStatus("omar")).toBe("critical");
  });
});

describe("helmet & demo account rules", () => {
  it("blood pressure and blood sugar are manual until the next helmet version", async () => {
    const { MANUAL_METRICS, MANUAL_NOTE, isManualMetric } = await import("@/lib/health/metrics");
    expect(MANUAL_NOTE).toBe("Manual now · Auto in next helmet version");
    expect([...MANUAL_METRICS].sort()).toEqual(["dia", "glucose", "sys"]);
    expect(isManualMetric("hr")).toBe(false);
  });
  it("the main demo astronaut is Rehab, Commander on the ISS", async () => {
    const { CREW, DEVICE } = await import("@/lib/health/data");
    expect(CREW[0]?.name).toBe("Rehab");
    expect(CREW[0]?.initials).toBe("R");
    expect(DEVICE.name).toBe("BOO Helmet S2");
  });
  it("the alerts badge counts every alert still listed (open + in progress)", async () => {
    const { ALERTS } = await import("@/lib/health/data");
    const active = ALERTS.filter((a) => a.state !== "resolved");
    expect(active.length).toBe(5);
  });
});
