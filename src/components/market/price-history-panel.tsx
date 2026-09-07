"use client";

import { AlertTriangle, History } from "lucide-react";

import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { en } from "@/i18n/en";
import { formatRupees } from "@/lib/format/price";
import { usePriceHistory } from "@/hooks/use-price-history";

/** Read-only audit log of recent crop-price changes, shared by the officer and admin management pages. */
export function PriceHistoryPanel() {
  const { history, loading, error } = usePriceHistory();

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    );
  }

  if (error) {
    return <EmptyState icon={AlertTriangle} title={en.market.loadError} description={error} />;
  }

  if (history.length === 0) {
    return <EmptyState icon={History} title={en.market.noHistory} />;
  }

  return (
    <ul className="divide-y rounded-lg border">
      {history.map((entry) => (
        <li key={entry.id} className="flex items-start justify-between gap-3 px-4 py-3 text-sm">
          <div>
            <p className="font-medium">
              {entry.cropName}
              {entry.centerName ? ` · ${entry.centerName}` : ` · ${en.market.stateWide}`}
            </p>
            <p className="text-xs text-muted-foreground">
              {entry.changedByName} ({entry.changedByRole}) · {entry.changedAtLabel}
            </p>
          </div>
          <p className="shrink-0 text-right font-medium">
            {entry.previousPrice == null ? (
              en.market.firstPriceSet
            ) : (
              <>
                <span className="text-muted-foreground line-through">{formatRupees(entry.previousPrice)}</span>{" "}
                {formatRupees(entry.newPrice)}
              </>
            )}
          </p>
        </li>
      ))}
    </ul>
  );
}
