import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { recommend, statusOf, type MetricKey, type Status } from "@/lib/health/metrics";
import { useAuth } from "@/lib/auth";

export interface Reading {
  id: string;
  metric: MetricKey;
  value: number;
  recorded_at: string;
  acknowledged: boolean;
}

const KEY = ["my-readings"];

/** The signed-in user's own readings, newest first (row-level security limits them to this user). */
export function useMyReadings() {
  const { user } = useAuth();
  return useQuery({
    queryKey: [...KEY, user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Reading[]> => {
      const { data, error } = await supabase
        .from("readings")
        .select("id, metric, value, recorded_at, acknowledged")
        .order("recorded_at", { ascending: false })
        .limit(1000);
      if (error) throw error;
      return (data ?? []).map((r) => ({ ...r, metric: r.metric as MetricKey, value: Number(r.value) }));
    },
  });
}

export function useAddReading() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: async (r: { metric: MetricKey; value: number }) => {
      if (!user) throw new Error("Not signed in");
      const { error } = await supabase.from("readings").insert({ metric: r.metric, value: r.value, user_id: user.id });
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useAcknowledgeReading() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("readings").update({ acknowledged: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

/** Latest reading per metric. */
export function latestByMetric(readings: Reading[]) {
  const out: Partial<Record<MetricKey, Reading>> = {};
  for (const r of readings) if (!out[r.metric]) out[r.metric] = r;
  return out;
}

export interface PersonalAlert {
  reading: Reading;
  status: Exclude<Status, "normal">;
  advice: string;
}
/** Every out-of-range reading becomes an alert; acknowledged ones are kept but no longer counted as open. */
export function alertsFromReadings(readings: Reading[]): PersonalAlert[] {
  return readings
    .map((r) => ({ reading: r, status: statusOf(r.metric, r.value) }))
    .filter((x): x is { reading: Reading; status: "watch" | "critical" } => x.status !== "normal")
    .map((x) => ({ ...x, advice: recommend(x.reading.metric, x.status) }));
}
