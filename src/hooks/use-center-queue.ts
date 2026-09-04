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

/** Live queue for one center/date. `null` centerId skips the subscription (e.g. no assigned center yet). */
export function useCenterQueue(centerId: string | null, dateKey: string): UseCenterQueueResult {
  const [state, setState] = useState<LoadedState | null>(null);
  const key = centerId ? `${centerId}|${dateKey}` : null;

  useEffect(() => {
    if (!centerId) return;
    const currentKey = `${centerId}|${dateKey}`;
    const unsubscribe = subscribeCenterQueue(
      centerId,
      dateKey,
      (data) => setState({ key: currentKey, queue: data, error: null }),
      (err) =>
        setState({ key: currentKey, queue: [], error: err.message || "Could not load the queue right now." })
    );
    return unsubscribe;
  }, [centerId, dateKey]);

  if (!key) return { queue: [], loading: false, error: null };
  if (!state || state.key !== key) return { queue: [], loading: true, error: null };
  return { queue: state.queue, loading: false, error: state.error };
}
