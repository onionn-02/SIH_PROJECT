"use client";

import { AlertTriangle, Search, Sprout } from "lucide-react";
import { useMemo, useState } from "react";

import { FarmerTabs } from "@/components/farmer/farmer-tabs";
import { MarketPriceCard } from "@/components/market/market-price-card";
import { PriceCompareCard } from "@/components/market/price-compare-card";
import { PriceCompareControls } from "@/components/market/price-compare-controls";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useCropPrices } from "@/hooks/use-crop-prices";
import { usePriceComparison } from "@/hooks/use-price-comparison";
import { useTranslations } from "@/hooks/use-translations";
import { addDaysToDateKey, todayDateKey } from "@/lib/format/datetime";
import { cn } from "@/lib/utils";

type ViewMode = "current" | "compare";

export default function FarmerMarketPricesPage() {
  const t = useTranslations();
  const { prices, loading, error } = useCropPrices();
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");
  const [view, setView] = useState<ViewMode>("current");
  const [compareFromDate, setCompareFromDate] = useState(() => addDaysToDateKey(todayDateKey(), -1));

  const regions = useMemo(() => {
    const byId = new Map<string, string>();
    for (const p of prices) if (p.centerId) byId.set(p.centerId, p.centerName ?? p.centerId);
    return Array.from(byId, ([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [prices]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return prices.filter((p) => {
      const matchesSearch = term.length === 0 || p.cropName.toLowerCase().includes(term);
      const matchesRegion =
        regionFilter === "all" ||
        (regionFilter === "statewide" ? p.centerId === null : p.centerId === regionFilter);
      return matchesSearch && matchesRegion;
    });
  }, [prices, search, regionFilter]);

  const {
    comparisons,
    loading: comparisonsLoading,
    error: comparisonsError,
  } = usePriceComparison(filtered, compareFromDate, todayDateKey());

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <FarmerTabs />
      <PageHeader title={t.market.pageTitle} description={t.market.pageDescription} icon={Sprout} />

      <div className="mb-4 flex gap-1 rounded-lg bg-muted p-1" role="tablist">
        {(["current", "compare"] as const).map((mode) => (
          <button
            key={mode}
            type="button"
            role="tab"
            aria-selected={view === mode}
            onClick={() => setView(mode)}
            className={cn(
              "flex-1 rounded-md px-3 py-2 text-center text-sm font-medium transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
              view === mode ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {mode === "current" ? t.market.compareTabToday : t.market.compareTabCompare}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          <Skeleton className="h-9 w-full sm:max-w-xs" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : error ? (
        <EmptyState icon={AlertTriangle} title={t.market.loadError} description={error} />
      ) : prices.length === 0 ? (
        <EmptyState icon={Sprout} title={t.market.noPrices} />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:max-w-xs">
              <Search
                className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t.market.searchPlaceholder}
                aria-label={t.market.searchPlaceholder}
                className="pl-8"
              />
            </div>
            {regions.length > 0 ? (
              <select
                value={regionFilter}
                onChange={(e) => setRegionFilter(e.target.value)}
                aria-label={t.market.cropRegion}
                className="h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <option value="all">{t.market.allRegions}</option>
                <option value="statewide">{t.market.stateWide}</option>
                {regions.map((region) => (
                  <option key={region.id} value={region.id}>
                    {region.name}
                  </option>
                ))}
              </select>
            ) : null}
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon={Search} title={t.market.noPrices} />
          ) : view === "current" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {filtered.map((price) => (
                <MarketPriceCard key={price.id} price={price} t={t} />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <PriceCompareControls fromDate={compareFromDate} onChangeFromDate={setCompareFromDate} t={t} />

              {comparisonsLoading ? (
                <div className="space-y-3">
                  <Skeleton className="h-28 w-full" />
                  <Skeleton className="h-28 w-full" />
                </div>
              ) : comparisonsError ? (
                <EmptyState icon={AlertTriangle} title={t.market.loadError} description={comparisonsError} />
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {comparisons.map((comparison) => (
                    <PriceCompareCard key={comparison.cropPriceId} comparison={comparison} t={t} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
