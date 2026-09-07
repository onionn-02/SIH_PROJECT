"use client";

import { IndianRupee } from "lucide-react";
import { useEffect, useState } from "react";

import { AdminTabs } from "@/components/admin/admin-tabs";
import { CropPriceTable } from "@/components/market/crop-price-table";
import { PriceHistoryPanel } from "@/components/market/price-history-panel";
import { PageHeader } from "@/components/shared/page-header";
import { en } from "@/i18n/en";
import { getAllCenters } from "@/services/centers";
import { useAuth } from "@/lib/auth/auth-context";
import type { AdminCenter } from "@/lib/demo/types";

export default function AdminPricesPage() {
  const { user, profile } = useAuth();
  const [centers, setCenters] = useState<AdminCenter[]>([]);

  useEffect(() => {
    getAllCenters()
      .then(setCenters)
      .catch(() => setCenters([]));
  }, []);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <AdminTabs />
      <PageHeader
        title={en.market.manageTitleAdmin}
        description={en.market.manageDescriptionAdmin}
        icon={IndianRupee}
      />

      {user && profile ? (
        <div className="space-y-8">
          <CropPriceTable
            centerOptions={centers}
            allowStatewide
            canDelete
            actor={{ uid: user.uid, name: profile.full_name, role: "admin" }}
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
