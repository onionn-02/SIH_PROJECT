import Link from "next/link";
import { CalendarCheck2, ClipboardCheck, ShieldCheck, Sprout, Users } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";

const AUDIENCES = [
  {
    role: "farmer",
    title: "I'm a farmer",
    description: "See your appointment, token and live queue position.",
    cta: "Go to farmer dashboard →",
    icon: Sprout,
    iconClassName: "text-emerald-600 dark:text-emerald-300",
    iconBgClassName: "bg-emerald-50 dark:bg-emerald-500/15",
    highlight: true,
  },
  {
    role: "officer",
    title: "I'm an officer",
    description: "Manage today's queue and update procurement status.",
    cta: "Go to officer dashboard →",
    icon: Users,
    iconClassName: "text-blue-600 dark:text-blue-300",
    iconBgClassName: "bg-blue-50 dark:bg-blue-500/15",
    highlight: false,
  },
  {
    role: "admin",
    title: "I'm an administrator",
    description: "Manage centers, schedules and view operational analytics.",
    cta: "Go to admin dashboard →",
    icon: ShieldCheck,
    iconClassName: "text-slate-600 dark:text-slate-300",
    iconBgClassName: "bg-slate-100 dark:bg-slate-500/15",
    highlight: false,
  },
] as const;

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

      <div className="grid gap-4 sm:grid-cols-3">
        {AUDIENCES.map((audience) => (
          <Card
            key={audience.role}
            className={cn(
              "transition-all hover:-translate-y-0.5 hover:shadow-md",
              audience.highlight
                ? "ring-2 ring-emerald-600/25 hover:ring-emerald-600/40 dark:ring-emerald-400/20"
                : "hover:ring-foreground/15"
            )}
          >
            <CardHeader>
              <div
                className={cn(
                  "mb-1 flex size-10 items-center justify-center rounded-full",
                  audience.iconBgClassName
                )}
              >
                <audience.icon className={cn("size-5", audience.iconClassName)} aria-hidden="true" />
              </div>
              <CardTitle className="text-base">{audience.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground">{audience.description}</p>
              <Link
                href={`${ROUTES.login}?role=${audience.role}`}
                className="text-sm font-medium text-primary hover:underline"
              >
                {audience.cta}
              </Link>
            </CardContent>
          </Card>
        ))}
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
