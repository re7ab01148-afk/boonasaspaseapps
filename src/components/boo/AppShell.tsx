import { useState, type ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  Activity,
  BarChart3,
  Bell,
  BookOpen,
  Cpu,
  FlaskConical,
  Info,
  LayoutDashboard,
  LogIn,
  LogOut,
  Menu,
  Orbit,
  PersonStanding,
  Trophy,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/lib/auth";
import { useMyReadings, alertsFromReadings } from "@/lib/readings";
import { cn } from "@/lib/utils";
import { useAppState } from "@/lib/app-state";
import { CREW, ENVIRONMENTS, NOW, fmtLongDate, fmtTime, overallStatus } from "@/lib/health/data";
import { AstronautAvatar } from "./ui";
import { BooLogo } from "./BooLogo";

const DEMO_NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/body", label: "Body Map", icon: PersonStanding },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/crew", label: "Crew", icon: Users },
  { to: "/alerts", label: "Alerts", icon: Bell },
  { to: "/missions", label: "Missions & XP", icon: Trophy },
  { to: "/guide", label: "Health Guide", icon: BookOpen },
  { to: "/device", label: "Device", icon: Cpu },
  { to: "/about", label: "About", icon: Info },
] as const;
const PERSONAL_NAV = [
  { to: "/dashboard", label: "My dashboard", icon: LayoutDashboard },
  { to: "/alerts", label: "My alerts", icon: Bell },
  { to: "/guide", label: "Health Guide", icon: BookOpen },
  { to: "/device", label: "Device", icon: Cpu },
  { to: "/about", label: "About", icon: Info },
] as const;
const PUBLIC_NAV = [
  { to: "/auth", label: "Sign in", icon: LogIn },
  { to: "/guide", label: "Health Guide", icon: BookOpen },
  { to: "/about", label: "About", icon: Info },
] as const;

/** Alerts that still need attention (not resolved / not acknowledged) — the same number the lists show. */
function useActiveAlertCount() {
  const { alerts } = useAppState();
  const { user, isDemo } = useAuth();
  const mine = useMyReadings();
  if (!user) return 0;
  if (isDemo) return alerts.filter((a) => a.state !== "resolved").length;
  return alertsFromReadings(mine.data ?? []).filter((a) => !a.reading.acknowledged).length;
}

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const open = useActiveAlertCount();
  const { user, isDemo } = useAuth();
  const nav = !user ? PUBLIC_NAV : isDemo ? DEMO_NAV : PERSONAL_NAV;
  return (
    <nav className="flex flex-col gap-1">
      {nav.map(({ to, label, icon: Icon }) => {
        const active = path.startsWith(to);
        return (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all",
              active
                ? "bg-gradient-primary text-primary-foreground shadow-glow"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            )}
          >
            <Icon className="size-[18px]" />
            <span className="flex-1">{label}</span>
            {to === "/alerts" && open > 0 && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[11px] font-bold",
                  active
                    ? "bg-primary-foreground/25"
                    : "bg-destructive text-destructive-foreground",
                )}
              >
                {open}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

function AstronautPicker() {
  const { astronaut, setAstronautId } = useAppState();
  return (
    <Select value={astronaut.id} onValueChange={setAstronautId}>
      <SelectTrigger
        className="h-11 w-full gap-3 rounded-2xl border-border bg-card px-2.5 shadow-sm md:w-64"
        aria-label="Choose astronaut"
      >
        <div className="flex min-w-0 items-center gap-3 text-start">
          <AstronautAvatar a={astronaut} size="sm" ring={overallStatus(astronaut.id)} />
          <div className="min-w-0 leading-tight">
            <p className="truncate text-sm font-semibold text-foreground">{astronaut.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {astronaut.role} · {ENVIRONMENTS[astronaut.env].short}
            </p>
          </div>
        </div>
      </SelectTrigger>
      <SelectContent>
        {CREW.map((a) => (
          <SelectItem key={a.id} value={a.id}>
            <span className="flex items-center gap-2.5">
              <AstronautAvatar a={a} size="sm" ring={overallStatus(a.id)} />
              <span>
                <span className="block text-sm font-semibold">{a.name}</span>
                <span className="block text-xs text-muted-foreground">
                  {a.agency} · {ENVIRONMENTS[a.env].name}
                </span>
              </span>
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function MarsToggle() {
  const { marsMode, setMarsMode } = useAppState();
  return (
    <label
      className={cn(
        "inline-flex cursor-pointer items-center gap-2 rounded-full border px-2.5 py-1.5 text-xs font-bold transition-colors",
        marsMode
          ? "border-destructive/30 bg-destructive/10 text-destructive"
          : "border-border bg-card text-foreground",
      )}
    >
      <Orbit className="size-3.5" />
      <span className="hidden sm:inline">Mars Mode</span>
      <Switch
        checked={marsMode}
        onCheckedChange={setMarsMode}
        aria-label="Mars Mode"
        className="scale-90"
      />
    </label>
  );
}

function AccountButton() {
  const { user, ready, displayName, isDemo, signOut } = useAuth();
  if (!ready) return <span className="size-10 animate-pulse rounded-full bg-muted" />;
  if (!user)
    return (
      <Button asChild variant="glow" size="sm" className="h-10 rounded-full px-4">
        <Link to="/auth">
          <LogIn /> <span className="hidden sm:inline">Sign in</span>
        </Link>
      </Button>
    );
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="inline-flex size-10 items-center justify-center rounded-full bg-gradient-primary font-display text-sm font-bold text-primary-foreground shadow-glow"
          aria-label="Account"
        >
          {displayName.slice(0, 1).toUpperCase()}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 rounded-2xl">
        <DropdownMenuLabel>
          <p className="truncate text-sm font-semibold">{displayName}</p>
          <p className="truncate text-xs font-normal text-muted-foreground">
            {isDemo ? "Demo account" : user.email}
          </p>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/dashboard">
            <LayoutDashboard /> My dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => void signOut()}>
          <LogOut /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const { astronaut, marsMode } = useAppState();
  const { user, isDemo } = useAuth();
  const open = useActiveAlertCount();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 start-0 z-30 hidden w-64 flex-col border-e border-sidebar-border bg-sidebar px-4 py-6 lg:flex">
        <BooLogo className="mb-8 px-2" />
        <NavLinks />
        <div className="mt-auto rounded-2xl bg-gradient-sky p-4 ring-1 ring-border">
          <div className="flex items-center gap-2 text-xs font-semibold text-success">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
              <span className="relative inline-flex size-2 rounded-full bg-success" />
            </span>
            Helmet connected
          </div>
          <p className="mt-1 text-sm font-semibold text-foreground">BOO Helmet S2 · 85%</p>
          <p className="text-xs text-muted-foreground">Synced 2 min ago</p>
        </div>
      </aside>

      <div className="lg:ps-64">
        <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur-xl">
          <div className="mx-auto flex max-w-[1400px] items-center gap-2 px-4 py-3 md:gap-3 md:px-8">
            <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="pill"
                  size="icon"
                  className="shrink-0 lg:hidden"
                  aria-label="Open menu"
                >
                  <Menu />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72 bg-sidebar p-5">
                <SheetTitle className="sr-only">Menu</SheetTitle>
                <div className="mb-6">
                  <BooLogo />
                </div>
                <NavLinks onNavigate={() => setMenuOpen(false)} />
              </SheetContent>
            </Sheet>
            <div className="lg:hidden">
              <BooLogo compact />
            </div>
            <div className="hidden min-w-0 flex-col 2xl:flex">
              {isDemo ? (
                <>
                  <span className="text-xs font-semibold text-muted-foreground">
                    {fmtLongDate(NOW)}
                  </span>
                  <span className="truncate font-display text-sm font-semibold text-foreground">
                    {astronaut.missionName} · Day {astronaut.missionDay}/{astronaut.missionLength} ·{" "}
                    {fmtTime(NOW)} MT
                  </span>
                </>
              ) : (
                <span className="font-display text-sm font-semibold text-foreground">
                  Your personal health log
                </span>
              )}
            </div>
            <div className="ms-auto flex items-center gap-2">
              <MarsToggle />
              {user && (
                <Link
                  to="/alerts"
                  className="relative hidden size-10 items-center justify-center rounded-full border border-border bg-card hover:bg-muted sm:inline-flex"
                  aria-label="Alerts"
                >
                  <Bell className="size-[18px] text-foreground" />
                  {open > 0 && (
                    <span className="absolute end-2.5 top-2 size-2 rounded-full bg-destructive ring-2 ring-card" />
                  )}
                </Link>
              )}
              {isDemo && (
                <div className="hidden xl:block">
                  <AstronautPicker />
                </div>
              )}
              <AccountButton />
            </div>
          </div>
          {isDemo && (
            <div className="px-4 pb-3 md:px-8 xl:hidden">
              <AstronautPicker />
            </div>
          )}
          {(isDemo || marsMode) && (
            <div className="flex flex-wrap items-center gap-2 border-t border-border bg-muted/60 px-4 py-2 text-xs font-semibold md:px-8">
              {isDemo && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-warning/15 px-2.5 py-1 text-warning-foreground">
                  <FlaskConical className="size-3.5" /> Simulated data based on NASA reference
                  ranges
                </span>
              )}
              {marsMode && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-2.5 py-1 text-destructive">
                  <Orbit className="size-3.5" /> Mars Mode: 20-min signal delay to Earth · on-board
                  recommendations active
                </span>
              )}
            </div>
          )}
        </header>
        <main className="mx-auto max-w-[1400px] px-4 py-6 md:px-8 md:py-8">{children}</main>
        <footer className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-2 px-4 pb-8 text-xs text-muted-foreground md:px-8">
          <span className="flex items-center gap-1.5">
            <Activity className="size-3.5" /> BOO · Smart Safety & Health Ecosystem — NASA Space
            Apps Challenge 2026
          </span>
          <span>Not for medical use</span>
        </footer>
      </div>
    </div>
  );
}
