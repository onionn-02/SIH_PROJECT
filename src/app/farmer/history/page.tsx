"use client";

import { AlertTriangle, History } from "lucide-react";

import { HistoryCard } from "@/components/farmer/appointment-card";
import { FarmerTabs } from "@/components/farmer/farmer-tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { useFarmerAppointments } from "@/hooks/use-farmer-appointments";
import { useTranslations } from "@/hooks/use-translations";
import { getPastAppointments } from "@/lib/appointments/derive";

export default function FarmerHistoryPage() {
  const t = useTranslations();
  const { appointments, loading, error } = useFarmerAppointments();
  const records = getPastAppointments(appointments);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <FarmerTabs />
      <PageHeader title={t.farmer.procurementHistory} description={t.farmer.historyDescription} />

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      ) : error ? (
        <EmptyState icon={AlertTriangle} title={t.farmer.loadErrorHistory} description={error} />
      ) : records.length === 0 ? (
        <EmptyState icon={History} title={t.farmer.noHistory} />
      ) : (
        <div className="space-y-3">
          {records.map((record) => (
            <HistoryCard key={record.id} appointment={record} />
          ))}
        </div>
      )}
    </div>
  );
}
