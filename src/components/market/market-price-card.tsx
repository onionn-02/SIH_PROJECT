import { MapPin } from "lucide-react";

import { PriceTrend } from "@/components/market/price-trend";
import { Card, CardContent } from "@/components/ui/card";
import { formatRupees } from "@/lib/format/price";
import type { Translations } from "@/i18n/en";
import type { MarketPrice } from "@/lib/demo/types";

const UNIT_KEY = { kg: "perKg", quintal: "perQuintal" } as const;

interface MarketPriceCardProps {
  price: MarketPrice;
  t: Translations;
}

/** Read-only crop price card for the farmer-facing market rates screens. */
export function MarketPriceCard({ price, t }: MarketPriceCardProps) {
  return (
    <Card>
      <CardContent className="space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="font-medium">{price.cropName}</p>
            <p className="text-xs text-muted-foreground">{t.market.category[price.category]}</p>
          </div>
          <PriceTrend
            price={price.price}
            previousPrice={price.previousPrice}
            upLabel={t.market.trendUp}
            downLabel={t.market.trendDown}
          />
        </div>

        <p className="text-2xl font-semibold tracking-tight">
          {formatRupees(price.price)}
          <span className="ml-1 text-sm font-normal text-muted-foreground">/ {t.market[UNIT_KEY[price.unit]]}</span>
        </p>

        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3 shrink-0" aria-hidden="true" />
          {price.centerName ?? t.market.stateWide}
        </div>

        <div className="border-t pt-2 text-xs text-muted-foreground">
          <p>
            {t.market.lastUpdated}: {price.updatedAtLabel}
          </p>
          <p>{t.market.updatedBy(price.updatedByName)}</p>
        </div>
      </CardContent>
    </Card>
  );
}
