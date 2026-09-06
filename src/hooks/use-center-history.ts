"use client";

import { useEffect, useState } from "react";

import { subscribeCenterHistory, type HistoryEntry } from "@/services/appointments";

interface UseCenterHistoryResult {
  entries: HistoryEntry[];
  loading: boolean;
  error: string | null;
}

interface LoadedState {
  key: string;
  entries: HistoryEntry[];
  error: string | null;
}

/** Live completed/cancelled/no-show log for one or more centers. Empty `centerIds` skips the subscription. */
export function useCenterHistory(centerIds: string[]): UseCenterHistoryResult {
  const [state, setState] = useState<LoadedState | null>(null);
  const key = centerIds.length > 0 ? centerIds.slice().sort().join(",") : null;

  useEffect(() => {
    if (centerIds.length === 0) return;
    const currentKey = centerIds.slice().sort().join(",");
    const unsubscribe = subscribeCenterHistory(
      centerIds,
      (data) => setState({ key: currentKey, entries: data, error: null }),
      (err) =>
        setState({ key: currentKey, entries: [], error: err.message || "Could not load history right now." })
    );
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed by `key`, not the centerIds array reference
  }, [key]);

  if (!key) return { entries: [], loading: false, error: null };
  if (!state || state.key !== key) return { entries: [], loading: true, error: null };
  return { entries: state.entries, loading: false, error: state.error };
}
