import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/lib/auth";
import { Surface } from "./ui";

/** Crew-wide pages run on the demo mission; personal accounts see an empty state instead. */
export function DemoOnly({ children }: { children: ReactNode }) {
  const { isDemo } = useAuth();
  if (isDemo) return <>{children}</>;
  return (
    <Surface className="flex flex-col items-center gap-3 py-14 text-center">
      <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
        <ClipboardList className="size-7" />
      </span>
      <h1 className="text-2xl font-bold text-foreground">No data yet</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        This view fills in with a full mission's worth of readings. Add your own from the dashboard, or sign in with the demo account to explore it.
      </p>
      <Button asChild variant="glow" size="xl" className="mt-2">
        <Link to="/dashboard">Go to my dashboard</Link>
      </Button>
    </Surface>
  );
}
