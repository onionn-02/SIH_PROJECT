"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

import {
  INITIAL_TODAY_QUEUE,
  withQueuePositions,
  type QueueAppointment,
} from "@/lib/demo/officer-demo-data";
import { isValidStatusTransition } from "@/lib/validation/status-transitions";
import type { AppointmentStatus } from "@/types/firestore";

export type QueueEntry = QueueAppointment & { queuePosition: number | null };

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
  /** The single WAITING appointment at queue position 1, if any. */
  nextWaiting: QueueEntry | null;
  checkIn: (id: string) => void;
  callNext: (id: string) => void;
  startProcurement: (id: string) => void;
  completeProcurement: (id: string) => void;
  markNoShow: (id: string) => void;
  cancelAppointment: (id: string) => void;
}

const OfficerQueueContext = createContext<OfficerQueueContextValue | null>(null);

/**
 * Holds today's queue for the officer section (CLAUDE.md §5, §18) as
 * in-memory client state. This mirrors what Day 4 will replace with a live
 * Firestore appointments query — the transition rules and derived queue
 * positions are written so that swap only needs to change where the data
 * comes from, not how status changes are validated or displayed.
 */
export function OfficerQueueProvider({ children }: { children: React.ReactNode }) {
  const [appointments, setAppointments] = useState<QueueAppointment[]>(INITIAL_TODAY_QUEUE);

  const transition = useCallback((id: string, to: AppointmentStatus) => {
    setAppointments((current) =>
      current.map((appointment) => {
        if (appointment.id !== id) return appointment;
        if (!isValidStatusTransition(appointment.status, to)) return appointment;
        return { ...appointment, status: to };
      })
    );
  }, []);

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

  const queue = useMemo(() => withQueuePositions(appointments), [appointments]);

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
      nextWaiting,
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
      nextWaiting,
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
