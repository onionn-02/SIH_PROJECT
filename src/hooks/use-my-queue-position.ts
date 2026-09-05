"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/lib/auth/auth-context";
import { getMyQueuePosition } from "@/services/queue-position";

const POLL_MS = 20_000;

interface LoadedState {
  key: string;
  queuePosition: number | null;
}

/**
 * Live-ish queue position for the signed-in farmer's own appointment, via
 * the /api/queue-position server route (see that route's docstring — a
 * direct Firestore query isn't possible for a farmer under the current
 * security rules). Polls on an interval since there's no client-side
 * listener for this; refetches immediately whenever `status` changes,
 * since a status change on this appointment is the clearest local signal
 * that the queue may have moved.
 */
export function useMyQueuePosition(appointmentId: string | null, status: string | undefined): number | null {
  const { user } = useAuth();
  const [state, setState] = useState<LoadedState | null>(null);
  const key = user && appointmentId ? `${user.uid}|${appointmentId}` : null;

  useEffect(() => {
    if (!user || !appointmentId) return;
    const currentKey = `${user.uid}|${appointmentId}`;
    let cancelled = false;

    async function fetchPosition() {
      const idToken = await user!.getIdToken();
      const result = await getMyQueuePosition(idToken, appointmentId!).catch(() => null);
      if (!cancelled && result) setState({ key: currentKey, queuePosition: result.queuePosition });
    }

    fetchPosition();
    const interval = setInterval(fetchPosition, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, [user, appointmentId, status]);

  if (!key || state?.key !== key) return null;
  return state.queuePosition;
}
