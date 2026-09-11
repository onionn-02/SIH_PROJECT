import { Minus, TrendingDown, TrendingUp } from "lucide-react";

import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { formatRupees } from "@/lib/format/price";
import { cn } from "@/lib/utils";
import type { Translations } from "@/i18n/en";
import type { PriceComparison } from "@/lib/demo/types";

const TREND_STYLES = {
  up: {
    icon: TrendingUp,
    text: "text-emerald-600 dark:text-emerald-400",
    chip: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300",
  },
  down: {
    icon: TrendingDown,
    text: "text-destructive",
    chip: "bg-red-50 text-red-700 dark:bg-red-500/15 dark:text-red-300",
  },
  same: {
    icon: Minus,
    text: "text-muted-foreground",
    chip: "bg-muted text-muted-foreground",
  },
} as const;

interface PriceCompareCardProps {
  comparison: PriceComparison;
  t: Translations;
}

/** One crop's plain-language "was it higher, lower, or the same" card — the Market Rates "Compare" tab's core unit. */
export function PriceCompareCard({ comparison, t }: PriceCompareCardProps) {
  const { from, to, diff, trend, cropName, category } = comparison;

  if (from.price == null || to.price == null) {
    return (
      <Card>
        <CardContent className="space-y-1">
          <p className="font-medium">{cropName}</p>
          <p className="text-sm text-muted-foreground">{t.market.compareNoData}</p>
        </CardContent>
      </Card>
    );
  }

  const style = TREND_STYLES[trend ?? "same"];
  const Icon = style.icon;
  const fromLabel = from.dateLabel ?? from.requestedDate;
  const verdict =
    trend === "up"
      ? t.market.compareHigherThan(fromLabel)
      : trend === "down"
        ? t.market.compareLowerThan(fromLabel)
        : t.market.compareSameAs(fromLabel);
  const hint = trend === "up" ? t.market.compareHintUp : trend === "down" ? t.market.compareHintDown : t.market.compareHintSame;
  const diffText = !diff ? formatRupees(0) : `${diff > 0 ? "+" : "−"}${formatRupees(Math.abs(diff))}`;

  return (
    <Card>
      <CardContent className="space-y-3">
        <div>
          <p className="font-medium">{cropName}</p>
          <p className="text-xs text-muted-foreground">{t.market.category[category]}</p>
        </div>

        <div className="flex items-center gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">{fromLabel}</p>
            <p className="text-lg font-semibold tracking-tight">{formatRupees(from.price)}</p>
          </div>
          <Icon className={cn("size-5 shrink-0", style.text)} aria-hidden="true" />
          <div className="min-w-0 flex-1 text-right">
            <p className="text-[10px] font-semibold tracking-wide text-muted-foreground uppercase">
              {t.market.compareTabToday}
            </p>
            <p className="text-xl font-bold tracking-tight">{formatRupees(to.price)}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className={cn("justify-between gap-2 border-t-0 text-xs font-medium", style.chip)}>
        <span>
          {verdict} <span className="font-normal opacity-80">· {hint}</span>
        </span>
        <span className="shrink-0 font-mono">{diffText}</span>
      </CardFooter>
    </Card>
  );
}
