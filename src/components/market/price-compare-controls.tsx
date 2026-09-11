"use client";

import { addDaysToDateKey, todayDateKey } from "@/lib/format/datetime";
import { cn } from "@/lib/utils";
import type { Translations } from "@/i18n/en";

interface PriceCompareControlsProps {
  fromDate: string;
  onChangeFromDate: (date: string) => void;
  t: Translations;
}

/** Yesterday / 1 week / 1 month quick chips plus a custom date picker — the farmer "Compare today's price with…" control. */
export function PriceCompareControls({ fromDate, onChangeFromDate, t }: PriceCompareControlsProps) {
  const today = todayDateKey();
  const yesterday = addDaysToDateKey(today, -1);

  const chips = [
    { date: yesterday, label: t.market.compareChipYesterday },
    { date: addDaysToDateKey(today, -7), label: t.market.compareChipWeek },
    { date: addDaysToDateKey(today, -30), label: t.market.compareChipMonth },
  ];
  const activeChip = chips.find((chip) => chip.date === fromDate);

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">{t.market.compareWithPrompt}</p>
      <div className="flex flex-wrap items-center gap-2">
        {chips.map((chip) => (
          <button
            key={chip.date}
            type="button"
            aria-pressed={activeChip?.date === chip.date}
            onClick={() => onChangeFromDate(chip.date)}
            className={cn(
              "rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
              activeChip?.date === chip.date
                ? "border-transparent bg-primary text-primary-foreground"
                : "border-input text-muted-foreground hover:text-foreground"
            )}
          >
            {chip.label}
          </button>
        ))}
        <input
          type="date"
          value={activeChip ? "" : fromDate}
          onChange={(e) => e.target.value && onChangeFromDate(e.target.value)}
          max={yesterday}
          aria-label={t.market.comparePickDateLabel}
          className={cn(
            "h-[30px] rounded-full border px-3 text-xs font-semibold outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
            activeChip ? "border-input bg-transparent text-muted-foreground" : "border-transparent bg-primary text-primary-foreground"
          )}
        />
      </div>
    </div>
  );
}
