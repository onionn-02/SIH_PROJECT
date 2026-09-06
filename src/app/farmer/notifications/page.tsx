"use client";

import { AlertTriangle } from "lucide-react";

import { FarmerTabs } from "@/components/farmer/farmer-tabs";
import { NotificationList } from "@/components/farmer/notification-list";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useNotifications } from "@/hooks/use-notifications";
import { useTranslations } from "@/hooks/use-translations";

export default function FarmerNotificationsPage() {
  const t = useTranslations();
  const { notifications, loading, error } = useNotifications();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <FarmerTabs />
      <PageHeader title={t.farmer.allNotifications} description={t.farmer.allNotificationsDescription} />

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : error ? (
        <EmptyState icon={AlertTriangle} title={t.farmer.loadErrorNotifications} description={error} />
      ) : (
        <NotificationList notifications={notifications} />
      )}
    </div>
  );
}
