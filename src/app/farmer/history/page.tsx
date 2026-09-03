import { History } from "lucide-react";

import { HistoryCard } from "@/components/farmer/appointment-card";
import { FarmerTabs } from "@/components/farmer/farmer-tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { en } from "@/i18n/en";
import { getPastAppointments } from "@/lib/demo/farmer-demo-data";

export default function FarmerHistoryPage() {
  const records = getPastAppointments();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <FarmerTabs />
      <PageHeader
        title={en.farmer.procurementHistory}
        description="Your completed, cancelled and missed procurement records."
      />

      {records.length === 0 ? (
        <EmptyState icon={History} title={en.farmer.noHistory} />
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
