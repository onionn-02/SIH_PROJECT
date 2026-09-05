"use client";

import { useEffect, useState } from "react";

import { subscribeCenterQueue, type QueueEntry } from "@/services/appointments";

interface UseCenterQueueResult {
  queue: QueueEntry[];
  loading: boolean;
  error: string | null;
}

interface LoadedState {
  key: string;
  queue: QueueEntry[];
  error: string | null;
}

/** Live queue for one or more centers/date. Empty `centerIds` skips the subscription (e.g. no assigned center yet). */
export function useCenterQueue(centerIds: string[], dateKey: string): UseCenterQueueResult {
  const [state, setState] = useState<LoadedState | null>(null);
  const idsKey = centerIds.length > 0 ? centerIds.slice().sort().join(",") : null;
  const key = idsKey ? `${idsKey}|${dateKey}` : null;

  useEffect(() => {
    if (centerIds.length === 0) return;
    const currentKey = `${centerIds.slice().sort().join(",")}|${dateKey}`;
    const unsubscribe = subscribeCenterQueue(
      centerIds,
      dateKey,
      (data) => setState({ key: currentKey, queue: data, error: null }),
      (err) =>
        setState({ key: currentKey, queue: [], error: err.message || "Could not load the queue right now." })
    );
    return unsubscribe;
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed by idsKey/dateKey, not the centerIds array reference
  }, [idsKey, dateKey]);

  if (!key) return { queue: [], loading: false, error: null };
  if (!state || state.key !== key) return { queue: [], loading: true, error: null };
  return { queue: state.queue, loading: false, error: state.error };
}
