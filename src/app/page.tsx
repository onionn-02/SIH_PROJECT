import Link from "next/link";
import { CalendarCheck2, ClipboardCheck, ShieldCheck, Sprout, Users } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/config/routes";

const AUDIENCES = [
  {
    role: "farmer",
    title: "I'm a farmer",
    description: "See your appointment, token and live queue position.",
    cta: "Go to farmer dashboard →",
    icon: Sprout,
    iconClassName: "text-emerald-600",
  },
  {
    role: "officer",
    title: "I'm an officer",
    description: "Manage today's queue and update procurement status.",
    cta: "Go to officer dashboard →",
    icon: Users,
    iconClassName: "text-blue-600",
  },
  {
    role: "admin",
    title: "I'm an administrator",
    description: "Manage centers, schedules and view operational analytics.",
    cta: "Go to admin dashboard →",
    icon: ShieldCheck,
    iconClassName: "text-slate-600",
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
    <div className="mx-auto flex max-w-4xl flex-col gap-16 px-4 py-16">
      <div className="space-y-3 text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          Know your procurement status, always.
        </h1>
        <p className="text-muted-foreground">
          Schedule, token and queue information for farmers and procurement
          centers — in one trusted place.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {AUDIENCES.map((audience) => (
          <Card
            key={audience.role}
            className="transition-shadow hover:shadow-md hover:ring-foreground/15"
          >
            <CardHeader>
              <audience.icon
                className={`mb-1 size-5 ${audience.iconClassName}`}
                aria-hidden="true"
              />
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
              <div className="mx-auto mb-3 flex size-9 items-center justify-center rounded-full bg-muted">
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
