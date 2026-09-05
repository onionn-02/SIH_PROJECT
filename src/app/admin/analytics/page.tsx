"use client";

import { AlertTriangle } from "lucide-react";

import { AdminTabs } from "@/components/admin/admin-tabs";
import {
  AverageWaitCard,
  CenterActivityChart,
  DailyCompletedChart,
  StatusDistributionChart,
} from "@/components/admin/analytics-charts";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { en } from "@/i18n/en";
import { useAdminAnalytics } from "@/hooks/use-admin-analytics";

export default function AdminAnalyticsPage() {
  const { dailyCompleted, statusDistribution, centerActivity, averageWaitMinutes, loading, error } =
    useAdminAnalytics();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <AdminTabs />
      <PageHeader title={en.nav.adminAnalytics} description={en.admin.analyticsDescription} />

      {error ? (
        <EmptyState icon={AlertTriangle} title="Couldn't load analytics data" description={error} />
      ) : loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          <DailyCompletedChart data={dailyCompleted} />
          <StatusDistributionChart data={statusDistribution} />
          <CenterActivityChart data={centerActivity} />
          <AverageWaitCard minutes={averageWaitMinutes} />
        </div>
      )}
    </div>
  );
}
