import { collection, getDocs, onSnapshot, query, Timestamp, where } from "firebase/firestore";

import { db } from "@/lib/firebase/client";
import { getWaitAndCallTimestamps } from "@/services/status-history";
import type { Appointment, ProcurementRecord } from "@/types/firestore";

export interface AdminAppointmentSummary {
  id: string;
  farmerId: string;
  centerId: string;
  status: Appointment["status"];
}

/**
 * Live, admin-wide view of every appointment on one date (not scoped to a
 * single center, unlike `subscribeCenterQueue`). Backs both the admin
 * dashboard's daily counts and the analytics status/center breakdowns.
 * Single equality filter only, so no composite index is needed.
 */
export function subscribeAppointmentsOnDate(
  dateKey: string,
  onData: (appointments: AdminAppointmentSummary[]) => void,
  onError: (error: Error) => void
): () => void {
  const q = query(collection(db, "appointments"), where("date", "==", dateKey));
  return onSnapshot(
    q,
    (snapshot) => {
      onData(
        snapshot.docs.map((d) => {
          const data = d.data() as Appointment;
          return { id: d.id, farmerId: data.farmer_id, centerId: data.center_id, status: data.status };
        })
      );
    },
    (err) => onError(err)
  );
}

/** Live count of profiles with role == "farmer". */
export function subscribeFarmerCount(
  onData: (count: number) => void,
  onError: (error: Error) => void
): () => void {
  const q = query(collection(db, "profiles"), where("role", "==", "farmer"));
  return onSnapshot(q, (snapshot) => onData(snapshot.size), (err) => onError(err));
}

/** Live count of centers with active == true. */
export function subscribeActiveCenterCount(
  onData: (count: number) => void,
  onError: (error: Error) => void
): () => void {
  const q = query(collection(db, "procurement_centers"), where("active", "==", true));
  return onSnapshot(q, (snapshot) => onData(snapshot.size), (err) => onError(err));
}

export interface DailyCompletedCount {
  dateKey: string;
  label: string;
  count: number;
}

const DAY_LABEL_FMT = new Intl.DateTimeFormat("en-IN", { weekday: "short" });

function dateKeyOf(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/**
 * Completed-procurement count per day for the last `days` days, from
 * `procurement_records.completed_at`. A single range filter on one field
 * needs no composite index; results are bucketed by day client-side
 * (small data volume — CLAUDE.md §32).
 */
export async function getDailyCompletedCounts(days: number): Promise<DailyCompletedCount[]> {
  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  since.setHours(0, 0, 0, 0);

  const snapshot = await getDocs(
    query(collection(db, "procurement_records"), where("completed_at", ">=", Timestamp.fromDate(since)))
  );

  const counts = new Map<string, number>();
  for (const docSnap of snapshot.docs) {
    const record = docSnap.data() as ProcurementRecord;
    const key = dateKeyOf(record.completed_at.toDate());
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const buckets: DailyCompletedCount[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const key = dateKeyOf(date);
    buckets.push({ dateKey: key, label: DAY_LABEL_FMT.format(date), count: counts.get(key) ?? 0 });
  }
  return buckets;
}

/**
 * Average minutes between WAITING and CALLED across the given completed
 * appointments, using status_history (the only place those timestamps are
 * recorded). Returns null when no appointment has both timestamps, so the
 * UI can show an honest "not enough data" state instead of a fake number
 * (CLAUDE.md §18).
 */
export async function getAverageWaitMinutes(
  completedAppointments: { id: string; farmerId: string }[]
): Promise<number | null> {
  const timestamps = await Promise.all(
    completedAppointments.map((a) => getWaitAndCallTimestamps(a.id, a.farmerId))
  );

  const waitMinutes = timestamps
    .filter((t): t is { waitingAt: Date; calledAt: Date } => t.waitingAt !== null && t.calledAt !== null)
    .map((t) => (t.calledAt.getTime() - t.waitingAt.getTime()) / 60_000)
    .filter((minutes) => minutes >= 0);

  return waitMinutes.length > 0
    ? Math.round(waitMinutes.reduce((a, b) => a + b, 0) / waitMinutes.length)
    : null;
}
