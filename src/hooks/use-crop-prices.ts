"use client";

import { useEffect, useState } from "react";

import { subscribeCropPrices } from "@/services/crop-prices";
import type { MarketPrice } from "@/lib/demo/types";

interface UseCropPricesResult {
  prices: MarketPrice[];
  loading: boolean;
  error: string | null;
}

/** Live list of every published crop price. Read-only for farmers, the base data for officer/admin management. */
export function useCropPrices(): UseCropPricesResult {
  const [prices, setPrices] = useState<MarketPrice[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return subscribeCropPrices(setPrices, (err) => {
      setError(err.message || "Could not load crop prices right now.");
      setPrices([]);
    });
  }, []);

  return { prices: prices ?? [], loading: prices === null, error };
}
