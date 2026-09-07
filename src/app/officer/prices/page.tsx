"use client";

import { IndianRupee } from "lucide-react";
import { useEffect, useState } from "react";

import { OfficerTabs } from "@/components/officer/officer-tabs";
import { CropPriceTable } from "@/components/market/crop-price-table";
import { PriceHistoryPanel } from "@/components/market/price-history-panel";
import { PageHeader } from "@/components/shared/page-header";
import { en } from "@/i18n/en";
import { getAllCenters } from "@/services/centers";
import { useAuth } from "@/lib/auth/auth-context";
import type { AdminCenter } from "@/lib/demo/types";

export default function OfficerPricesPage() {
  const { user, profile } = useAuth();
  const [centers, setCenters] = useState<AdminCenter[]>([]);

  useEffect(() => {
    getAllCenters()
      .then(setCenters)
      .catch(() => setCenters([]));
  }, []);

  const assignedCenterIds = profile?.assigned_center_ids ?? [];
  const assignedCenters = centers.filter((c) => assignedCenterIds.includes(c.id));

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <OfficerTabs />
      <PageHeader
        title={en.market.manageTitleOfficer}
        description={en.market.manageDescriptionOfficer}
        icon={IndianRupee}
      />

      {user && profile ? (
        <div className="space-y-8">
          <CropPriceTable
            centerOptions={assignedCenters}
            allowStatewide={false}
            canDelete={false}
            actor={{ uid: user.uid, name: profile.full_name, role: "officer" }}
            restrictToCenterIds={assignedCenterIds}
          />

          <section aria-labelledby="price-history-heading">
            <h2 id="price-history-heading" className="mb-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase">
              {en.market.historyTitle}
            </h2>
            <PriceHistoryPanel />
          </section>
        </div>
      ) : null}
    </div>
  );
}
