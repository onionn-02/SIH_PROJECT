"use client";

import { AlertTriangle, Pencil, Search, Sprout, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

import { CropPriceForm } from "@/components/market/crop-price-form";
import { PriceTrend } from "@/components/market/price-trend";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { en } from "@/i18n/en";
import { formatPriceWithUnit } from "@/lib/format/price";
import { deleteCropPrice, type CropPriceActor } from "@/services/crop-prices";
import { useCropPrices } from "@/hooks/use-crop-prices";
import type { AdminCenter, MarketPrice } from "@/lib/demo/types";

interface CenterOption {
  id: string;
  name: string;
}

interface CropPriceTableProps {
  /** Centers this actor may set/edit a price for. */
  centerOptions: CenterOption[] | AdminCenter[];
  /** Admin only — officers are always scoped to a specific assigned center. */
  allowStatewide: boolean;
  /** Admin only. */
  canDelete: boolean;
  actor: CropPriceActor;
  /** If set, only prices for these centers (plus state-wide) are shown — an officer's assigned centers. */
  restrictToCenterIds?: string[];
}

export function CropPriceTable({
  centerOptions,
  allowStatewide,
  canDelete,
  actor,
  restrictToCenterIds,
}: CropPriceTableProps) {
  const { prices: allPrices, loading, error } = useCropPrices();
  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");
  const [addingNew, setAddingNew] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const scopedPrices = useMemo(() => {
    if (!restrictToCenterIds) return allPrices;
    const allowed = new Set(restrictToCenterIds);
    return allPrices.filter((p) => p.centerId !== null && allowed.has(p.centerId));
  }, [allPrices, restrictToCenterIds]);

  const regions = useMemo(() => {
    const byId = new Map<string, string>();
    for (const p of scopedPrices) if (p.centerId) byId.set(p.centerId, p.centerName ?? p.centerId);
    return Array.from(byId, ([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [scopedPrices]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return scopedPrices.filter((p) => {
      const matchesSearch = term.length === 0 || p.cropName.toLowerCase().includes(term);
      const matchesRegion =
        regionFilter === "all" ||
        (regionFilter === "statewide" ? p.centerId === null : p.centerId === regionFilter);
      return matchesSearch && matchesRegion;
    });
  }, [scopedPrices, search, regionFilter]);

  async function handleDelete(price: MarketPrice) {
    if (!window.confirm(en.market.confirmDelete)) return;
    setDeleteError(null);
    setDeletingId(price.id);
    try {
      await deleteCropPrice(price.id);
    } catch {
      setDeleteError(en.market.deleteFailed);
    } finally {
      setDeletingId(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-9 w-full sm:max-w-xs" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (error) {
    return <EmptyState icon={AlertTriangle} title={en.market.loadError} description={error} />;
  }

  return (
    <div className="space-y-4">
      {deleteError ? (
        <p role="alert" className="text-sm text-destructive">
          {deleteError}
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative w-full sm:max-w-xs">
            <Search
              className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={en.market.searchPlaceholder}
              aria-label={en.market.searchPlaceholder}
              className="pl-8"
            />
          </div>
          {regions.length > 0 ? (
            <select
              value={regionFilter}
              onChange={(e) => setRegionFilter(e.target.value)}
              aria-label={en.market.cropRegion}
              className="h-9 rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              <option value="all">{en.market.allRegions}</option>
              {allowStatewide ? <option value="statewide">{en.market.stateWide}</option> : null}
              {regions.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.name}
                </option>
              ))}
            </select>
          ) : null}
        </div>
        {!addingNew ? (
          <Button size="sm" onClick={() => setAddingNew(true)} disabled={!allowStatewide && centerOptions.length === 0}>
            {en.market.addCrop}
          </Button>
        ) : null}
      </div>

      {addingNew ? (
        <CropPriceForm
          centerOptions={centerOptions}
          allowStatewide={allowStatewide}
          actor={actor}
          onDone={() => setAddingNew(false)}
        />
      ) : null}

      {filtered.length === 0 ? (
        <EmptyState icon={Sprout} title={en.market.noManagedPrices} />
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-lg border md:block">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-2 font-medium">{en.market.tableCrop}</th>
                  <th className="px-4 py-2 font-medium">{en.market.tableCurrentPrice}</th>
                  <th className="px-4 py-2 font-medium">{en.market.tableUnit}</th>
                  <th className="px-4 py-2 font-medium">{en.market.tableRegion}</th>
                  <th className="px-4 py-2 font-medium">{en.market.tableLastUpdated}</th>
                  <th className="px-4 py-2 font-medium">{en.market.tableUpdatedBy}</th>
                  <th className="px-4 py-2 font-medium">{en.market.tableActions}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((price) =>
                  editingId === price.id ? (
                    <tr key={price.id}>
                      <td colSpan={7} className="p-3">
                        <CropPriceForm
                          price={price}
                          centerOptions={centerOptions}
                          allowStatewide={allowStatewide}
                          actor={actor}
                          onDone={() => setEditingId(null)}
                        />
                      </td>
                    </tr>
                  ) : (
                    <tr key={price.id}>
                      <td className="px-4 py-3 font-medium">
                        {price.cropName}
                        <div className="text-xs font-normal text-muted-foreground">
                          {en.market.category[price.category]}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium">{formatPriceWithUnit(price.price, price.unit)}</div>
                        <PriceTrend
                          price={price.price}
                          previousPrice={price.previousPrice}
                          upLabel={en.market.trendUp}
                          downLabel={en.market.trendDown}
                        />
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {price.unit === "kg" ? en.market.perKg : en.market.perQuintal}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{price.centerName ?? en.market.stateWide}</td>
                      <td className="px-4 py-3 text-muted-foreground">{price.updatedAtLabel}</td>
                      <td className="px-4 py-3 text-muted-foreground">{price.updatedByName}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => setEditingId(price.id)}>
                            <Pencil className="size-4" aria-hidden="true" />
                            {en.market.editCrop}
                          </Button>
                          {canDelete ? (
                            <Button
                              size="sm"
                              variant="ghost"
                              aria-label={`${en.market.deleteCrop} ${price.cropName}`}
                              disabled={deletingId === price.id}
                              onClick={() => handleDelete(price)}
                            >
                              <Trash2 className="size-4" aria-hidden="true" />
                            </Button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {filtered.map((price) =>
              editingId === price.id ? (
                <CropPriceForm
                  key={price.id}
                  price={price}
                  centerOptions={centerOptions}
                  allowStatewide={allowStatewide}
                  actor={actor}
                  onDone={() => setEditingId(null)}
                />
              ) : (
                <div key={price.id} className="rounded-lg border p-4">
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold">{price.cropName}</p>
                      <p className="text-xs text-muted-foreground">
                        {en.market.category[price.category]} · {price.centerName ?? en.market.stateWide}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatPriceWithUnit(price.price, price.unit)}</p>
                      <PriceTrend
                        price={price.price}
                        previousPrice={price.previousPrice}
                        upLabel={en.market.trendUp}
                        downLabel={en.market.trendDown}
                      />
                    </div>
                  </div>
                  <p className="mb-3 text-xs text-muted-foreground">
                    {price.updatedAtLabel} · {price.updatedByName}
                  </p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditingId(price.id)}>
                      <Pencil className="size-4" aria-hidden="true" />
                      {en.market.editCrop}
                    </Button>
                    {canDelete ? (
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={deletingId === price.id}
                        onClick={() => handleDelete(price)}
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                        {en.market.deleteCrop}
                      </Button>
                    ) : null}
                  </div>
                </div>
              )
            )}
          </div>
        </>
      )}
    </div>
  );
}
