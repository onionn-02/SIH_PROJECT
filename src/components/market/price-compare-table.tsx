"use client";

import { AlertTriangle, Minus, TrendingDown, TrendingUp } from "lucide-react";
import { useMemo, useState } from "react";

import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { en } from "@/i18n/en";
import { useCropPrices } from "@/hooks/use-crop-prices";
import { usePriceComparison } from "@/hooks/use-price-comparison";
import { addDaysToDateKey, todayDateKey } from "@/lib/format/datetime";
import { formatPriceWithUnit, formatRupees } from "@/lib/format/price";
import { cn } from "@/lib/utils";
import type { PriceComparison } from "@/lib/demo/types";

interface PriceCompareTableProps {
  /** If set, only prices for these centers are shown — an officer's assigned centers. */
  restrictToCenterIds?: string[];
}

const TREND_STYLES = {
  up: { icon: TrendingUp, chip: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300" },
  down: { icon: TrendingDown, chip: "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300" },
  same: { icon: Minus, chip: "bg-muted text-muted-foreground" },
} as const;

function verdictLabel(trend: PriceComparison["trend"]) {
  if (trend === "up") return en.market.trendUp;
  if (trend === "down") return en.market.trendDown;
  return en.market.compareSame;
}

/** Officer/admin date-range price comparison — any two dates, across every crop they manage. */
export function PriceCompareTable({ restrictToCenterIds }: PriceCompareTableProps) {
  const { prices: allPrices, loading: pricesLoading, error: pricesError } = useCropPrices();
  const today = todayDateKey();
  const [fromDate, setFromDate] = useState(() => addDaysToDateKey(today, -1));
  const [toDate, setToDate] = useState(today);

  const scopedPrices = useMemo(() => {
    if (!restrictToCenterIds) return allPrices;
    const allowed = new Set(restrictToCenterIds);
    return allPrices.filter((p) => p.centerId !== null && allowed.has(p.centerId));
  }, [allPrices, restrictToCenterIds]);

  const {
    comparisons,
    loading: comparisonsLoading,
    error: comparisonsError,
  } = usePriceComparison(scopedPrices, fromDate, toDate);

  if (pricesLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-9 w-full sm:max-w-md" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (pricesError) {
    return <EmptyState icon={AlertTriangle} title={en.market.loadError} description={pricesError} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1.5">
          <label htmlFor="compare-from" className="block text-xs font-medium text-muted-foreground">
            {en.market.compareFromDate}
          </label>
          <input
            id="compare-from"
            type="date"
            value={fromDate}
            max={today}
            onChange={(e) => e.target.value && setFromDate(e.target.value)}
            className="h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="compare-to" className="block text-xs font-medium text-muted-foreground">
            {en.market.compareToDate}
          </label>
          <input
            id="compare-to"
            type="date"
            value={toDate}
            max={today}
            onChange={(e) => e.target.value && setToDate(e.target.value)}
            className="h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
      </div>

      {comparisonsLoading ? (
        <Skeleton className="h-40 w-full" />
      ) : comparisonsError ? (
        <EmptyState icon={AlertTriangle} title={en.market.loadError} description={comparisonsError} />
      ) : comparisons.length === 0 ? (
        <EmptyState icon={AlertTriangle} title={en.market.noManagedPrices} />
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-lg border md:block">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-2 font-medium">{en.market.tableCrop}</th>
                  <th className="px-4 py-2 font-medium">{en.market.compareFromDate}</th>
                  <th className="px-4 py-2 font-medium">{en.market.compareToDate}</th>
                  <th className="px-4 py-2 font-medium">{en.market.compareTableChange}</th>
                  <th className="px-4 py-2 font-medium">{en.market.compareTableVerdict}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {comparisons.map((comparison) => (
                  <CompareRow key={comparison.cropPriceId} comparison={comparison} />
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {comparisons.map((comparison) => (
              <CompareMobileRow key={comparison.cropPriceId} comparison={comparison} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function CompareRow({ comparison }: { comparison: PriceComparison }) {
  const { from, to, diff, pct, trend, cropName, category, unit } = comparison;

  if (from.price == null || to.price == null) {
    return (
      <tr>
        <td className="px-4 py-3 font-medium">
          {cropName}
          <div className="text-xs font-normal text-muted-foreground">{en.market.category[category]}</div>
        </td>
        <td colSpan={4} className="px-4 py-3 text-muted-foreground">
          {en.market.compareNoData}
        </td>
      </tr>
    );
  }

  const style = TREND_STYLES[trend ?? "same"];
  const Icon = style.icon;
  const diffText = !diff ? formatRupees(0) : `${diff > 0 ? "+" : "−"}${formatRupees(Math.abs(diff))}`;
  const pctText = pct == null ? "" : ` · ${Math.abs(pct).toFixed(1)}%`;

  return (
    <tr>
      <td className="px-4 py-3 font-medium">
        {cropName}
        <div className="text-xs font-normal text-muted-foreground">{en.market.category[category]}</div>
      </td>
      <td className="px-4 py-3">
        {formatPriceWithUnit(from.price, unit)}
        <div className="text-xs text-muted-foreground">{from.dateLabel}</div>
      </td>
      <td className="px-4 py-3">
        {formatPriceWithUnit(to.price, unit)}
        <div className="text-xs text-muted-foreground">{to.dateLabel}</div>
      </td>
      <td className="px-4 py-3 font-mono text-xs">
        {diffText}
        {pctText}
      </td>
      <td className="px-4 py-3">
        <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium", style.chip)}>
          <Icon className="size-3.5" aria-hidden="true" />
          {verdictLabel(trend)}
        </span>
      </td>
    </tr>
  );
}

function CompareMobileRow({ comparison }: { comparison: PriceComparison }) {
  const { from, to, diff, trend, cropName, category, unit } = comparison;

  if (from.price == null || to.price == null) {
    return (
      <div className="rounded-lg border p-4">
        <p className="font-semibold">{cropName}</p>
        <p className="text-xs text-muted-foreground">{en.market.category[category]}</p>
        <p className="mt-2 text-sm text-muted-foreground">{en.market.compareNoData}</p>
      </div>
    );
  }

  const style = TREND_STYLES[trend ?? "same"];
  const Icon = style.icon;
  const diffText = !diff ? formatRupees(0) : `${diff > 0 ? "+" : "−"}${formatRupees(Math.abs(diff))}`;

  return (
    <div className="rounded-lg border p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold">{cropName}</p>
          <p className="text-xs text-muted-foreground">{en.market.category[category]}</p>
        </div>
        <span className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium", style.chip)}>
          <Icon className="size-3.5" aria-hidden="true" />
          {verdictLabel(trend)}
        </span>
      </div>
      <div className="flex items-center justify-between gap-2 text-sm">
        <div>
          <p className="text-[10px] font-medium text-muted-foreground uppercase">{from.dateLabel}</p>
          <p className="font-medium">{formatPriceWithUnit(from.price, unit)}</p>
        </div>
        <span className="font-mono text-xs text-muted-foreground">{diffText}</span>
        <div className="text-right">
          <p className="text-[10px] font-medium text-muted-foreground uppercase">{to.dateLabel}</p>
          <p className="font-medium">{formatPriceWithUnit(to.price, unit)}</p>
        </div>
      </div>
    </div>
  );
}
