"use client";

import { useEffect, useState } from "react";

import { subscribePriceHistory } from "@/services/crop-prices";
import type { PriceHistoryItem } from "@/lib/demo/types";

interface UsePriceHistoryResult {
  history: PriceHistoryItem[];
  loading: boolean;
  error: string | null;
}

/** Live feed of the most recent crop-price changes, for the officer/admin audit view. */
export function usePriceHistory(max = 30): UsePriceHistoryResult {
  const [history, setHistory] = useState<PriceHistoryItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return subscribePriceHistory(
      setHistory,
      (err) => {
        setError(err.message || "Could not load price history right now.");
        setHistory([]);
      },
      max
    );
  }, [max]);

  return { history: history ?? [], loading: history === null, error };
}
