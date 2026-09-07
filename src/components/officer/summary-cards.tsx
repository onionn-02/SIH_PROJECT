"use client";

import { CalendarDays, CheckCircle2, Clock, Loader2, type LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { en } from "@/i18n/en";
import { useOfficerQueue } from "@/lib/officer/queue-context";
import { cn } from "@/lib/utils";

export function SummaryCards() {
  const { summary, loading } = useOfficerQueue();

  const cards: { label: string; value: number; icon: LucideIcon; className: string }[] = [
    {
      label: en.queue.todayTotal,
      value: summary.total,
      icon: CalendarDays,
      className: "bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300",
    },
    {
      label: en.officer.waiting,
      value: summary.waiting,
      icon: Clock,
      className: "bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    },
    {
      label: en.officer.inProgress,
      value: summary.inProgress,
      icon: Loader2,
      className: "bg-blue-50 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300",
    },
    {
      label: en.officer.completed,
      value: summary.completed,
      icon: CheckCircle2,
      className: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
    },
  ];

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((card) => (
          <Skeleton key={card.label} className="h-[68px] w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
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
