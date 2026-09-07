"use client";

import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  Clock,
  MapPin,
  Users,
  type LucideIcon,
} from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { en } from "@/i18n/en";
import { cn } from "@/lib/utils";
import type { AdminDashboardStats } from "@/hooks/use-admin-dashboard";

export function StatCards({ stats, loading }: { stats: AdminDashboardStats | null; loading: boolean }) {
  const cards: { label: string; value: number | undefined; icon: LucideIcon; className: string }[] = [
    {
      label: en.admin.totalFarmers,
      value: stats?.totalFarmers,
      icon: Users,
      className: "bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300",
    },
    {
      label: en.admin.activeCenters,
      value: stats?.activeCenters,
      icon: MapPin,
      className: "bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300",
    },
    {
      label: en.admin.todayAppointments,
      value: stats?.todayAppointments,
      icon: CalendarClock,
      className: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
    },
    {
      label: en.admin.completedToday,
      value: stats?.completedToday,
      icon: CheckCircle2,
      className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    },
    {
      label: en.admin.waitingNow,
      value: stats?.waitingNow,
      icon: Clock,
      className: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    },
    {
      label: en.admin.cancelledNoShow,
      value: stats?.cancelledOrNoShow,
      icon: AlertTriangle,
      className: "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {cards.map((card) => (
          <Skeleton key={card.label} className="h-[68px] w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {cards.map((card) => (
        <Card key={card.label} size="sm">
          <CardContent className="text-center">
            <div
              className={cn(
                "mx-auto mb-1 flex size-8 items-center justify-center rounded-full",
                card.className
              )}
            >
              <card.icon className="size-4" aria-hidden="true" />
            </div>
            <p className="text-2xl font-semibold">{card.value}</p>
            <p className="text-xs text-muted-foreground">{card.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
