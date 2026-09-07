"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CROP_CATEGORIES } from "@/config/crop-categories";
import { en } from "@/i18n/en";
import { createCropPrice, updateCropPrice, type CropPriceActor, type CropPriceInput } from "@/services/crop-prices";
import { todayDateKey } from "@/lib/format/datetime";
import type { AdminCenter, MarketPrice } from "@/lib/demo/types";

interface CenterOption {
  id: string;
  name: string;
}

interface CropPriceFormProps {
  price?: MarketPrice;
  /** Centers this actor may set a price for. */
  centerOptions: CenterOption[] | AdminCenter[];
  /** Admin only — officers are always scoped to one of their assigned centers. */
  allowStatewide: boolean;
  actor: CropPriceActor;
  onDone: () => void;
}

function emptyValues(defaultCenterId: string): CropPriceInput {
  return {
    cropName: "",
    category: "vegetable",
    unit: "quintal",
    price: 0,
    centerId: defaultCenterId || null,
    centerName: null,
    effectiveDate: todayDateKey(),
  };
}

/** Create/edit form for a crop's procurement price, shared by the officer and admin management pages. */
export function CropPriceForm({ price, centerOptions, allowStatewide, actor, onDone }: CropPriceFormProps) {
  const [values, setValues] = useState<CropPriceInput>(
    price
      ? {
          cropName: price.cropName,
          category: price.category,
          unit: price.unit,
          price: price.price,
          centerId: price.centerId,
          centerName: price.centerName,
          effectiveDate: price.effectiveDate,
        }
      : emptyValues(allowStatewide ? "" : (centerOptions[0]?.id ?? ""))
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof CropPriceInput>(key: K, value: CropPriceInput[K]) {
    setValues((v) => ({ ...v, [key]: value }));
  }

  function setCenter(centerId: string) {
    if (centerId === "") {
      set("centerId", null);
      set("centerName", null);
      return;
    }
    const match = centerOptions.find((c) => c.id === centerId);
    set("centerId", centerId);
    set("centerName", match?.name ?? null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (price) {
        await updateCropPrice(price.id, values, actor);
      } else {
        await createCropPrice(values, actor);
      }
      onDone();
    } catch {
      setError(en.market.saveFailed);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg border p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="crop-name">{en.market.cropName}</Label>
          <Input
            id="crop-name"
            required
            value={values.cropName}
            onChange={(e) => set("cropName", e.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="crop-category">{en.market.cropCategory}</Label>
          <select
            id="crop-category"
            required
            value={values.category}
            onChange={(e) => set("category", e.target.value as CropPriceInput["category"])}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            {CROP_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {en.market.category[c.value]}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="crop-price">{en.market.cropPrice}</Label>
          <Input
            id="crop-price"
            type="number"
            min={0}
            step="0.01"
            required
            value={values.price}
            onChange={(e) => set("price", Number(e.target.value))}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="crop-unit">{en.market.cropUnit}</Label>
          <select
            id="crop-unit"
            required
            value={values.unit}
            onChange={(e) => set("unit", e.target.value as CropPriceInput["unit"])}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <option value="kg">₹ / {en.market.perKg}</option>
            <option value="quintal">₹ / {en.market.perQuintal}</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="crop-date">{en.market.cropEffectiveDate}</Label>
          <Input
            id="crop-date"
            type="date"
            required
            value={values.effectiveDate}
            onChange={(e) => set("effectiveDate", e.target.value)}
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="crop-region">{en.market.cropRegion}</Label>
        <select
          id="crop-region"
          required={!allowStatewide}
          value={values.centerId ?? ""}
          onChange={(e) => setCenter(e.target.value)}
          className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {allowStatewide ? <option value="">{en.market.stateWide}</option> : null}
          {centerOptions.map((center) => (
            <option key={center.id} value={center.id}>
              {center.name}
            </option>
          ))}
        </select>
      </div>

      {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}

      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={saving || (!allowStatewide && !values.centerId)}>
          {saving ? en.market.saving : en.market.save}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onDone}>
          {en.market.cancelForm}
        </Button>
      </div>
    </form>
  );
}
