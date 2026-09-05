"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { en } from "@/i18n/en";
import type { AdminDashboardStats } from "@/hooks/use-admin-dashboard";

export function StatCards({ stats, loading }: { stats: AdminDashboardStats | null; loading: boolean }) {
  const cards = [
    { label: en.admin.totalFarmers, value: stats?.totalFarmers },
    { label: en.admin.activeCenters, value: stats?.activeCenters },
    { label: en.admin.todayAppointments, value: stats?.todayAppointments },
    { label: en.admin.completedToday, value: stats?.completedToday },
    { label: en.admin.waitingNow, value: stats?.waitingNow },
    { label: en.admin.cancelledNoShow, value: stats?.cancelledOrNoShow },
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
            <p className="text-2xl font-semibold">{card.value}</p>
            <p className="text-xs text-muted-foreground">{card.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
