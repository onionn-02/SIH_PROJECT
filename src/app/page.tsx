"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FirebaseError } from "firebase/app";
import { CalendarCheck2, ClipboardCheck, Loader2, ShieldCheck, Sprout, Users } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { ROUTES } from "@/config/routes";
import { en } from "@/i18n/en";
import { useAuth } from "@/lib/auth/auth-context";
import { DEMO_ACCOUNTS } from "@/lib/demo/demo-accounts";
import { cn } from "@/lib/utils";

type DemoRole = "farmer" | "officer" | "admin";

const AUDIENCES: {
  role: DemoRole;
  title: string;
  description: string;
  cta: string;
  icon: typeof Sprout;
  accent: string;
  highlight: boolean;
}[] = [
  {
    role: "farmer",
    title: "I'm a farmer",
    description: "See your appointment, token and live queue position.",
    cta: "Enter farmer dashboard",
    icon: Sprout,
    accent: "emerald",
    highlight: true,
  },
  {
    role: "officer",
    title: "I'm an officer",
    description: "Manage today's queue and update procurement status.",
    cta: "Enter officer dashboard",
    icon: Users,
    accent: "blue",
    highlight: false,
  },
  {
    role: "admin",
    title: "I'm an administrator",
    description: "Manage centers, schedules and view operational analytics.",
    cta: "Enter admin dashboard",
    icon: ShieldCheck,
    accent: "slate",
    highlight: false,
  },
];

const ACCENT_CLASSES: Record<
  string,
  { iconBg: string; icon: string; ring: string; glow: string }
> = {
  emerald: {
    iconBg: "bg-emerald-50 dark:bg-emerald-500/15",
    icon: "text-emerald-600 dark:text-emerald-300",
    ring: "ring-emerald-600/25 hover:ring-emerald-600/50 dark:ring-emerald-400/20 dark:hover:ring-emerald-400/40",
    glow: "hover:shadow-emerald-600/20 dark:hover:shadow-emerald-400/10",
  },
  blue: {
    iconBg: "bg-blue-50 dark:bg-blue-500/15",
    icon: "text-blue-600 dark:text-blue-300",
    ring: "ring-foreground/10 hover:ring-blue-600/40 dark:hover:ring-blue-400/40",
    glow: "hover:shadow-blue-600/20 dark:hover:shadow-blue-400/10",
  },
  slate: {
    iconBg: "bg-slate-100 dark:bg-slate-500/15",
    icon: "text-slate-600 dark:text-slate-300",
    ring: "ring-foreground/10 hover:ring-slate-500/40 dark:hover:ring-slate-300/40",
    glow: "hover:shadow-slate-500/20 dark:hover:shadow-slate-300/10",
  },
};

const DASHBOARD_ROUTE: Record<DemoRole, string> = {
  farmer: ROUTES.farmer.dashboard,
  officer: ROUTES.officer.dashboard,
  admin: ROUTES.admin.dashboard,
};

function friendlyEntryError(error: unknown): string {
  if (error instanceof FirebaseError) {
    switch (error.code) {
      case "auth/invalid-credential":
      case "auth/wrong-password":
      case "auth/user-not-found":
        return en.login.invalidCredentials;
      case "auth/too-many-requests":
        return en.login.tooManyAttempts;
    }
  }
  return en.login.genericError;
}

const HOW_IT_WORKS = [
  {
    icon: CalendarCheck2,
    title: "Know your schedule",
    description: "See exactly when and where your procurement is booked.",
  },
  {
    icon: Users,
    title: "See your place in line",
    description: "Your token and live queue position, always up to date.",
  },
  {
    icon: ClipboardCheck,
    title: "Track it to completion",
    description: "Follow the status from waiting to completed, in plain language.",
  },
] as const;

export default function HomePage() {
  const router = useRouter();
  const { user, loading: authLoading, signIn } = useAuth();
  const [pendingRole, setPendingRole] = useState<DemoRole | null>(null);
  const [entryError, setEntryError] = useState<string | null>(null);

  async function enterAs(role: DemoRole) {
    if (pendingRole || authLoading) return;

    // Signed out: send the user to the real login form (pre-filled with the
    // demo credentials) instead of signing them in silently, so signing out
    // always requires signing back in on purpose.
    if (!user) {
      router.push(`${ROUTES.login}?role=${role}`);
      return;
    }

    setEntryError(null);
    setPendingRole(role);
    try {
      const { email, password } = DEMO_ACCOUNTS[role];
      await signIn(email, password);
      router.push(DASHBOARD_ROUTE[role]);
    } catch (err) {
      setEntryError(friendlyEntryError(err));
      setPendingRole(null);
    }
  }

  return (
    <div className="mx-auto flex max-w-4xl flex-col gap-16 px-4 py-12">
      <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-b from-emerald-50 via-emerald-50/40 to-background px-6 py-14 text-center sm:py-20 dark:from-emerald-500/10 dark:via-emerald-500/5">
        <div className="relative space-y-3">
          <div className="mb-2 flex justify-center">
            <Logo size={64} className="drop-shadow-sm" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Know your procurement status, always.
          </h1>
          <p className="mx-auto max-w-md text-muted-foreground">
            Schedule, token and queue information for farmers and procurement
            centers — in one trusted place.
          </p>
        </div>
      </div>

      <div id="choose-role" className="scroll-mt-20 space-y-3">
        <div className="grid gap-4 sm:grid-cols-3">
          {AUDIENCES.map((audience) => {
            const accent = ACCENT_CLASSES[audience.accent];
            const isPending = pendingRole === audience.role;
            const isDisabled = pendingRole !== null && !isPending;
            return (
              <button
                key={audience.role}
                type="button"
                onClick={() => enterAs(audience.role)}
                disabled={pendingRole !== null || authLoading}
                aria-busy={isPending}
                className={cn(
                  "group relative flex flex-col items-start gap-1 rounded-xl bg-card p-4 text-left text-sm text-card-foreground ring-1 transition-all duration-200 ease-out",
                  "hover:-translate-y-1 hover:shadow-lg active:translate-y-0 active:scale-[0.98] active:shadow-md",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  "disabled:pointer-events-none",
                  audience.highlight ? "ring-2 ring-emerald-600/25 dark:ring-emerald-400/20" : "ring-foreground/10",
                  accent.ring,
                  accent.glow,
                  isPending && "-translate-y-1 shadow-lg",
                  isDisabled && "opacity-40"
                )}
              >
                <div
                  className={cn(
                    "mb-1 flex size-10 items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-110",
                    accent.iconBg
                  )}
                >
                  {isPending ? (
                    <Loader2 className={cn("size-5 animate-spin", accent.icon)} aria-hidden="true" />
                  ) : (
                    <audience.icon className={cn("size-5", accent.icon)} aria-hidden="true" />
                  )}
                </div>
                <p className="font-heading text-base leading-snug font-medium">{audience.title}</p>
                <p className="mb-3 text-sm text-muted-foreground">{audience.description}</p>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                  {isPending ? en.login.signingIn : audience.cta}
                  {!isPending && (
                    <span className="transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true">
                      →
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
        {entryError ? (
          <p role="alert" className="text-center text-sm text-destructive">
            {entryError}
          </p>
        ) : null}
      </div>

      <div className="border-t pt-10">
        <h2 className="mb-6 text-center text-sm font-semibold tracking-wide text-muted-foreground uppercase">
          How it works
        </h2>
        <div className="grid gap-6 sm:grid-cols-3">
          {HOW_IT_WORKS.map((step) => (
            <div key={step.title} className="text-center">
              <div className="mx-auto mb-3 flex size-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                <step.icon className="size-4.5" aria-hidden="true" />
              </div>
              <p className="font-medium">{step.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
