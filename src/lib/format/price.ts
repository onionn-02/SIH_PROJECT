import type { PriceUnit } from "@/types/firestore";

const RUPEE_FMT = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 2 });

/** "₹1,850" */
export function formatRupees(amount: number): string {
  return `₹${RUPEE_FMT.format(amount)}`;
}

/** "₹1,850 / quintal" */
export function formatPriceWithUnit(amount: number, unit: PriceUnit): string {
  return `${formatRupees(amount)} / ${unit}`;
}

export type PriceTrend = "up" | "down" | "same";

/** Direction of the current price versus the previous one, or null if there's no previous price to compare. */
export function priceTrend(current: number, previous: number | null): PriceTrend | null {
  if (previous == null) return null;
  if (current > previous) return "up";
  if (current < previous) return "down";
  return "same";
}
