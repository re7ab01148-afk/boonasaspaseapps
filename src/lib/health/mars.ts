import type { MetricKey, Status } from "./metrics";

const ONBOARD_STEP: Partial<Record<MetricKey, string>> = {
  hr: "Run an on-board ECG strip and compare with your baseline.",
  spo2: "Check cabin O₂ partial pressure and the finger sensor; switch to the backup oximeter.",
  temp: "Start the on-board infection checklist and log temperature every 30 min.",
  sys: "Repeat on both arms and log the higher value; pause heavy exercise.",
  dia: "Repeat on both arms and log the higher value; pause heavy exercise.",
  sleep: "The on-board scheduler moved your next task block by 1 h.",
  mood: "A private recorded message slot and a hobby block were added to today.",
  hydration: "Drink from the potable water dispenser now and set a 30 min reminder.",
};

/** Step-by-step autonomous plan used when Earth is too far away to answer in time (Mars Mode). */
export function marsSteps(metric: MetricKey, severity: Status, firstStep: string): string[] {
  const steps = [firstStep, ONBOARD_STEP[metric] ?? ONBOARD_STEP.hr!];
  if (severity === "critical") {
    steps.push(
      "Do not wait for Earth: the crew medical officer leads care using the on-board medical kit.",
    );
  }
  steps.push(
    "Re-measure and log again. Mission Control reads this in 20 min; a reply takes at least 40 min.",
  );
  return steps;
}
