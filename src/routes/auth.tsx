import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Loader2, Rocket } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import helmet from "@/assets/boo-helmet.png";
import { supabase } from "@/integrations/supabase/client";
import { DEMO_EMAIL, DEMO_PASSWORD } from "@/lib/demo-constants";
import { ensureDemoAccount } from "@/lib/demo-account.functions";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>) => ({
    redirect:
      typeof s.redirect === "string" && s.redirect.startsWith("/") && !s.redirect.startsWith("//")
        ? s.redirect
        : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Sign in · BOO Astronaut Health" },
      {
        name: "description",
        content:
          "Sign in to log your own health readings, get instant alerts and track your trends — or try the demo account.",
      },
      { property: "og:title", content: "Sign in · BOO Astronaut Health" },
      {
        property: "og:description",
        content: "Your personal astronaut health log. Try the demo account or create your own.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const { redirect } = Route.useSearch();
  const [busy, setBusy] = useState<null | "in" | "up" | "demo">(null);
  const [sentTo, setSentTo] = useState<string | null>(null);
  const go = () =>
    navigate({ to: (redirect as "/dashboard" | undefined) ?? "/dashboard", replace: true });

  async function signIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy("in");
    const { error } = await supabase.auth.signInWithPassword({
      email: String(f.get("email")),
      password: String(f.get("password")),
    });
    setBusy(null);
    if (error) return toast.error("Couldn't sign in", { description: error.message });
    go();
  }

  async function signUp(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const email = String(f.get("email"));
    setBusy("up");
    const { data, error } = await supabase.auth.signUp({
      email,
      password: String(f.get("password")),
      options: {
        emailRedirectTo: window.location.origin,
        data: { display_name: String(f.get("name") || "").trim() },
      },
    });
    setBusy(null);
    if (error) return toast.error("Couldn't create account", { description: error.message });
    if (data.session) return go();
    setSentTo(email);
  }

  async function tryDemo() {
    setBusy("demo");
    try {
      await ensureDemoAccount();
      const { error } = await supabase.auth.signInWithPassword({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
      });
      if (error) throw error;
      go();
    } catch (err) {
      toast.error("Demo account unavailable", {
        description: err instanceof Error ? err.message : "Please try again.",
      });
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mx-auto max-w-md py-6 md:py-10">
      <div className="mb-6 text-center">
        <div className="mb-3 flex items-center justify-center gap-3">
          <img src={helmet} alt="" width={44} height={44} className="size-11" />
          <span className="text-left leading-none">
            <span className="block font-display text-2xl font-extrabold text-foreground">BOO</span>
            <span className="mt-1 block text-[10px] font-semibold tracking-[0.2em] text-muted-foreground uppercase">
              Health ecosystem
            </span>
          </span>
        </div>
        <h1 className="text-3xl font-bold text-foreground">Your personal health log</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Sign in to log your own readings, get instant alerts and track your trends.
        </p>
      </div>

      <div className="surface p-6">
        {sentTo ? (
          <div className="space-y-3 text-center">
            <h2 className="text-xl font-bold text-foreground">Check your email</h2>
            <p className="text-sm text-muted-foreground">
              We sent a confirmation link to{" "}
              <span className="font-semibold text-foreground">{sentTo}</span>. Open it to activate
              your account, then sign in.
            </p>
            <Button variant="pill" onClick={() => setSentTo(null)}>
              Back to sign in
            </Button>
          </div>
        ) : (
          <Tabs defaultValue="in">
            <TabsList className="mb-5 grid h-auto w-full grid-cols-2 rounded-full bg-muted p-1">
              <TabsTrigger value="in" className="rounded-full py-1.5">
                Sign in
              </TabsTrigger>
              <TabsTrigger value="up" className="rounded-full py-1.5">
                Create account
              </TabsTrigger>
            </TabsList>
            <TabsContent value="in">
              <form onSubmit={signIn} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="in-email">Email</Label>
                  <Input
                    id="in-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="h-11 rounded-full"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="in-pass">Password</Label>
                  <Input
                    id="in-pass"
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    className="h-11 rounded-full"
                  />
                </div>
                <Button
                  type="submit"
                  variant="glow"
                  size="xl"
                  className="rounded-full"
                  disabled={busy !== null}
                >
                  {busy === "in" && <Loader2 className="animate-spin" />} Sign in
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="up">
              <form onSubmit={signUp} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="up-name">Name</Label>
                  <Input
                    id="up-name"
                    name="name"
                    required
                    maxLength={60}
                    autoComplete="name"
                    className="h-11 rounded-full"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="up-email">Email</Label>
                  <Input
                    id="up-email"
                    name="email"
                    type="email"
                    required
                    autoComplete="email"
                    className="h-11 rounded-full"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="up-pass">Password</Label>
                  <Input
                    id="up-pass"
                    name="password"
                    type="password"
                    required
                    minLength={8}
                    autoComplete="new-password"
                    className="h-11 rounded-full"
                  />
                  <p className="text-xs text-muted-foreground">At least 8 characters.</p>
                </div>
                <Button
                  type="submit"
                  variant="glow"
                  size="xl"
                  className="rounded-full"
                  disabled={busy !== null}
                >
                  {busy === "up" && <Loader2 className="animate-spin" />} Create account
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        )}

        <div className="my-5 flex items-center gap-3 text-xs text-muted-foreground">
          <span className="h-px flex-1 bg-border" /> or <span className="h-px flex-1 bg-border" />
        </div>
        <Button
          variant="soft"
          size="xl"
          className="w-full rounded-full"
          onClick={tryDemo}
          disabled={busy !== null}
        >
          {busy === "demo" ? <Loader2 className="animate-spin" /> : <Rocket />} Try demo account
        </Button>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Signs you in as Rehab, Commander on the ISS, with a full simulated mission.
        </p>
      </div>
    </div>
  );
}
