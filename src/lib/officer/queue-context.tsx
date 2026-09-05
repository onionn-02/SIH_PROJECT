"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

import { useAuth } from "@/lib/auth/auth-context";
import { todayDateKey } from "@/lib/format/datetime";
import { useCenterQueue } from "@/hooks/use-center-queue";
import { transitionAppointmentStatus } from "@/services/appointments";
import type { QueueEntry } from "@/services/appointments";

export type { QueueEntry };

interface QueueSummary {
  total: number;
  waiting: number;
  /** Farmers who have been called or are currently being served. */
  inProgress: number;
  completed: number;
}

interface OfficerQueueContextValue {
  queue: QueueEntry[];
  summary: QueueSummary;
  loading: boolean;
  error: string | null;
  /** Feedback from the most recent status-change action, if it failed. */
  actionError: string | null;
  dismissActionError: () => void;
  /** The single WAITING appointment at queue position 1, if any. */
  nextWaiting: QueueEntry | null;
  /** True while a status-change request for this appointment is in flight. */
  isPending: (id: string) => boolean;
  checkIn: (id: string) => void;
  callNext: (id: string) => void;
  startProcurement: (id: string) => void;
  completeProcurement: (id: string) => void;
  markNoShow: (id: string) => void;
  cancelAppointment: (id: string) => void;
}

const OfficerQueueContext = createContext<OfficerQueueContextValue | null>(null);

/**
 * Live view of today's queue at the signed-in officer's assigned center
 * (CLAUDE.md §5, §18), backed by Firestore. Status changes go through
 * transitionAppointmentStatus, which validates the transition, writes the
 * audit trail and notifies the farmer in one transaction.
 */
export function OfficerQueueProvider({ children }: { children: React.ReactNode }) {
  const { user, profile } = useAuth();
  const dateKey = todayDateKey();
  const { queue, loading, error } = useCenterQueue(profile?.assigned_center_id ?? null, dateKey);
  const [actionError, setActionError] = useState<string | null>(null);
  const dismissActionError = useCallback(() => setActionError(null), []);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());

  /**
   * Tracked per-appointment so an action button can disable itself the
   * instant it's clicked — the live queue snapshot that would otherwise
   * remove/replace the button can lag a click by a few hundred ms, long
   * enough for a fast double-click to fire the same transition twice (the
   * second call then hits an already-moved appointment and throws).
   */
  const transition = useCallback(
    (id: string, to: Parameters<typeof transitionAppointmentStatus>[1]) => {
      if (!user || pendingIds.has(id)) return;
      setActionError(null);
      setPendingIds((prev) => new Set(prev).add(id));
      transitionAppointmentStatus(id, to, user.uid)
        .catch((err) => {
          console.error("Status transition failed:", err);
          setActionError(
            err instanceof Error ? err.message : "Could not update this appointment right now."
          );
        })
        .finally(() => {
          setPendingIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        });
    },
    [user, pendingIds]
  );

  const isPending = useCallback((id: string) => pendingIds.has(id), [pendingIds]);

  const checkIn = useCallback((id: string) => transition(id, "WAITING"), [transition]);
  const callNext = useCallback((id: string) => transition(id, "CALLED"), [transition]);
  const startProcurement = useCallback(
    (id: string) => transition(id, "IN_PROGRESS"),
    [transition]
  );
  const completeProcurement = useCallback(
    (id: string) => transition(id, "COMPLETED"),
    [transition]
  );
  const markNoShow = useCallback((id: string) => transition(id, "NO_SHOW"), [transition]);
  const cancelAppointment = useCallback(
    (id: string) => transition(id, "CANCELLED"),
    [transition]
  );

  const summary = useMemo<QueueSummary>(
    () => ({
      total: queue.length,
      waiting: queue.filter((a) => a.status === "WAITING").length,
      inProgress: queue.filter((a) => a.status === "CALLED" || a.status === "IN_PROGRESS").length,
      completed: queue.filter((a) => a.status === "COMPLETED").length,
    }),
    [queue]
  );

  const nextWaiting = useMemo(() => queue.find((a) => a.queuePosition === 1) ?? null, [queue]);

  const value = useMemo<OfficerQueueContextValue>(
    () => ({
      queue,
      summary,
      loading,
      error,
      actionError,
      dismissActionError,
      nextWaiting,
      isPending,
      checkIn,
      callNext,
      startProcurement,
      completeProcurement,
      markNoShow,
      cancelAppointment,
    }),
    [
      queue,
      summary,
      loading,
      error,
      actionError,
      dismissActionError,
      nextWaiting,
      isPending,
      checkIn,
      callNext,
      startProcurement,
      completeProcurement,
      markNoShow,
      cancelAppointment,
    ]
  );

  return <OfficerQueueContext.Provider value={value}>{children}</OfficerQueueContext.Provider>;
}

export function useOfficerQueue(): OfficerQueueContextValue {
  const ctx = useContext(OfficerQueueContext);
  if (!ctx) {
    throw new Error("useOfficerQueue must be used within an OfficerQueueProvider");
  }
  return ctx;
}
