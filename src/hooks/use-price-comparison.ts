"use client";

import { useEffect, useState } from "react";

import { getPriceComparisons } from "@/services/crop-prices";
import type { MarketPrice, PriceComparison } from "@/lib/demo/types";

interface UsePriceComparisonResult {
  comparisons: PriceComparison[];
  loading: boolean;
  error: string | null;
}

interface ComparisonResult {
  key: string;
  comparisons: PriceComparison[];
  error: string | null;
}

/** Resolves a from/to price comparison for every given crop whenever the crop list or either date changes. */
export function usePriceComparison(
  prices: MarketPrice[],
  fromDate: string,
  toDate: string
): UsePriceComparisonResult {
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const requestKey = `${prices.map((p) => p.id).join(",")}|${fromDate}|${toDate}`;

  useEffect(() => {
    let active = true;

    getPriceComparisons(prices, fromDate, toDate)
      .then((comparisons) => {
        if (active) setResult({ key: requestKey, comparisons, error: null });
      })
      .catch((err: Error) => {
        if (active) {
          setResult({
            key: requestKey,
            comparisons: [],
            error: err.message || "Could not load the price comparison right now.",
          });
        }
      });

    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- requestKey already encodes prices/fromDate/toDate
  }, [requestKey]);

  const loading = result === null || result.key !== requestKey;
  return { comparisons: loading ? [] : result.comparisons, loading, error: loading ? null : result.error };
}
