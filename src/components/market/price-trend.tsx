import { Minus, TrendingDown, TrendingUp } from "lucide-react";

import { formatRupees, priceTrend } from "@/lib/format/price";
import { cn } from "@/lib/utils";

interface PriceTrendProps {
  price: number;
  previousPrice: number | null;
  upLabel: string;
  downLabel: string;
  className?: string;
}

/** Small inline up/down indicator comparing the current price to the previous one. Renders nothing if there's no previous price to compare against. */
export function PriceTrend({ price, previousPrice, upLabel, downLabel, className }: PriceTrendProps) {
  const trend = priceTrend(price, previousPrice);
  if (trend === null || previousPrice === null) return null;

  if (trend === "same") {
    return (
      <span className={cn("inline-flex items-center gap-1 text-xs text-muted-foreground", className)}>
        <Minus className="size-3" aria-hidden="true" />
        {formatRupees(previousPrice)}
      </span>
    );
  }

  const isUp = trend === "up";
  const diff = Math.abs(price - previousPrice);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium",
        isUp ? "text-emerald-600 dark:text-emerald-400" : "text-destructive",
        className
      )}
    >
      {isUp ? <TrendingUp className="size-3" aria-hidden="true" /> : <TrendingDown className="size-3" aria-hidden="true" />}
      <span className="sr-only">{isUp ? upLabel : downLabel}: </span>
      {formatRupees(diff)}
    </span>
  );
}
