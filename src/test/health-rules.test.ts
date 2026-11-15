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
  it("Sarah is all normal and Omar has a critical reading", () => {
    expect(overallStatus("sarah")).toBe("normal");
    expect(overallStatus("omar")).toBe("critical");
  });
});
