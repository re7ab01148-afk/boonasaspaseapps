import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { ALERTS, getAstronaut, type AlertState, type Astronaut, type CrewAlert } from "@/lib/health/data";

interface AppState {
  astronaut: Astronaut;
  setAstronautId: (id: string) => void;
  marsMode: boolean;
  setMarsMode: (on: boolean) => void;
  /** Crew alerts with any changes the user made (acknowledge / resolve / dismiss) applied. */
  alerts: CrewAlert[];
  setAlertState: (id: string, state: AlertState) => void;
}

const Ctx = createContext<AppState | null>(null);
const STORAGE_KEY = "boo-demo-state";

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [astronautId, setAstronautId] = useState("rehab");
  const [marsMode, setMarsMode] = useState(false);
  const [overrides, setOverrides] = useState<Record<string, AlertState>>({});
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (typeof s.astronautId === "string") setAstronautId(s.astronautId);
        if (typeof s.marsMode === "boolean") setMarsMode(s.marsMode);
        if (s.overrides && typeof s.overrides === "object") setOverrides(s.overrides);
      }
    } catch {
      /* ignore corrupt storage */
    }
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (!loaded) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ astronautId, marsMode, overrides }));
  }, [loaded, astronautId, marsMode, overrides]);

  const setAlertState = useCallback((id: string, state: AlertState) => {
    setOverrides((o) => ({ ...o, [id]: state }));
  }, []);

  const alerts = useMemo(() => ALERTS.map((a) => (overrides[a.id] ? { ...a, state: overrides[a.id] } : a)), [overrides]);

  const value = useMemo(
    () => ({ astronaut: getAstronaut(astronautId), setAstronautId, marsMode, setMarsMode, alerts, setAlertState }),
    [astronautId, marsMode, alerts, setAlertState],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppState() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAppState must be used inside AppStateProvider");
  return v;
}
