import { Users } from "lucide-react";

import { NextFarmerCard } from "@/components/officer/next-farmer-card";
import { OfficerTabs } from "@/components/officer/officer-tabs";
import { SummaryCards } from "@/components/officer/summary-cards";
import { PageHeader } from "@/components/shared/page-header";
import { en } from "@/i18n/en";

export default function OfficerDashboardPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <OfficerTabs />
      <PageHeader
        title={en.nav.officerDashboard}
        description="Today's summary and the next farmer to call."
        icon={Users}
      />

      <div className="mb-6">
        <SummaryCards />
      </div>

      <NextFarmerCard />
    </div>
  );
}
