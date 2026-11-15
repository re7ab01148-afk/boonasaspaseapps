import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Satellite } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { SectionHead, Surface } from "./ui";

interface IssNow {
  latitude: number;
  longitude: number;
  altitude: number;
  velocity: number;
  visibility: string;
}

async function fetchIss(): Promise<IssNow> {
  const res = await fetch("https://api.wheretheiss.at/v1/satellites/25544");
  if (!res.ok) throw new Error("ISS service unavailable");
  return res.json();
}

const MAP_W = 360;
const MAP_H = 180;
const px = (lon: number) => ((lon + 180) / 360) * MAP_W;
const py = (lat: number) => ((90 - lat) / 180) * MAP_H;

export function IssTracker() {
  const q = useQuery({ queryKey: ["iss-now"], queryFn: fetchIss, refetchInterval: 5000, retry: 1 });
  const [trail, setTrail] = useState<[number, number][]>([]);
  useEffect(() => {
    if (q.data) setTrail((t) => [...t.slice(-40), [q.data.longitude, q.data.latitude]]);
  }, [q.data]);

  return (
    <Surface>
      <SectionHead
        icon={<Satellite />}
        title="Live ISS position"
        sub="Updated every 5 seconds"
        action={
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success/10 px-2.5 py-1 text-[11px] font-bold text-success">
            <span className="size-1.5 animate-pulse rounded-full bg-success" /> Live
          </span>
        }
      />
      {q.isPending ? (
        <div className="space-y-3">
          <Skeleton className="aspect-[2/1] w-full rounded-2xl" />
          <div className="grid grid-cols-2 gap-3">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-14 rounded-2xl" />
            ))}
          </div>
        </div>
      ) : q.isError || !q.data ? (
        <p className="rounded-2xl bg-muted p-4 text-sm text-muted-foreground">
          Can't reach the ISS tracking service right now. It will retry automatically.
        </p>
      ) : (
        <>
          <div className="overflow-hidden rounded-2xl bg-gradient-sky ring-1 ring-border" dir="ltr">
            <svg
              viewBox={`0 0 ${MAP_W} ${MAP_H}`}
              className="block h-auto w-full"
              role="img"
              aria-label="ISS position on a world grid"
            >
              {[-60, -30, 0, 30, 60].map((lat) => (
                <line
                  key={lat}
                  x1={0}
                  x2={MAP_W}
                  y1={py(lat)}
                  y2={py(lat)}
                  className="stroke-border"
                  strokeDasharray={lat === 0 ? undefined : "3 4"}
                />
              ))}
              {[-120, -60, 0, 60, 120].map((lon) => (
                <line
                  key={lon}
                  y1={0}
                  y2={MAP_H}
                  x1={px(lon)}
                  x2={px(lon)}
                  className="stroke-border"
                  strokeDasharray="3 4"
                />
              ))}
              {trail.length > 1 && (
                <polyline
                  fill="none"
                  className="stroke-primary/50"
                  strokeWidth={1.5}
                  points={trail.map(([lo, la]) => `${px(lo)},${py(la)}`).join(" ")}
                />
              )}
              <circle
                cx={px(q.data.longitude)}
                cy={py(q.data.latitude)}
                r={10}
                className="animate-pulse fill-primary/20"
              />
              <circle
                cx={px(q.data.longitude)}
                cy={py(q.data.latitude)}
                r={4.5}
                className="fill-primary stroke-card"
                strokeWidth={2}
              />
            </svg>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3">
            {[
              ["Latitude", `${q.data.latitude.toFixed(2)}°`],
              ["Longitude", `${q.data.longitude.toFixed(2)}°`],
              ["Altitude", `${q.data.altitude.toFixed(0)} km`],
              ["Speed", `${Math.round(q.data.velocity).toLocaleString("en-US")} km/h`],
            ].map(([k, v]) => (
              <div key={k} className="rounded-2xl bg-muted p-3">
                <p className="text-xs font-semibold text-muted-foreground">{k}</p>
                <p className="font-display text-base font-bold text-foreground tabular">{v}</p>
              </div>
            ))}
          </div>
          <p className="mt-2 text-xs text-muted-foreground">
            Currently in {q.data.visibility === "daylight" ? "daylight" : "Earth's shadow"} ·
            wheretheiss.at
          </p>
        </>
      )}
    </Surface>
  );
}
