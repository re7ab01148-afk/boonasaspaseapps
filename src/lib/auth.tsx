import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const DEMO_EMAIL = "rehab.demo@boo-health.app";
export const DEMO_PASSWORD = "boo-demo-2026";

interface AuthState {
  ready: boolean;
  session: Session | null;
  user: User | null;
  /** The pre-filled demo account (Rehab) that shows the simulated crew data. */
  isDemo: boolean;
  displayName: string;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthState | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const { data } = supabase.auth.onAuthStateChange((event, s) => {
      setSession(s);
      if (event !== "SIGNED_IN" && event !== "SIGNED_OUT" && event !== "USER_UPDATED") return;
      router.invalidate();
      if (event !== "SIGNED_OUT") queryClient.invalidateQueries();
    });
    supabase.auth.getSession().then(({ data: d }) => {
      setSession(d.session);
      setReady(true);
    });
    return () => data.subscription.unsubscribe();
  }, [router, queryClient]);

  const value = useMemo<AuthState>(() => {
    const user = session?.user ?? null;
    const isDemo = user?.app_metadata?.demo === true;
    const meta = user?.user_metadata as { display_name?: string } | undefined;
    return {
      ready,
      session,
      user,
      isDemo,
      displayName: isDemo ? "Rehab" : meta?.display_name || user?.email?.split("@")[0] || "",
      signOut: async () => {
        await queryClient.cancelQueries();
        queryClient.clear();
        await supabase.auth.signOut();
        router.navigate({ to: "/auth", replace: true });
      },
    };
  }, [ready, session, queryClient, router]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useAuth must be used inside AuthProvider");
  return v;
}
