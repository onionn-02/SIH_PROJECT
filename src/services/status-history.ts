import { addDoc, collection, getDocs, query, serverTimestamp, where } from "firebase/firestore";

import { formatTimestampLabel } from "@/lib/format/datetime";
import { db } from "@/lib/firebase/client";
import type { DemoStatusStep } from "@/lib/demo/types";
import type { AppointmentStatus, StatusHistoryEntry } from "@/types/firestore";
import type { Timestamp } from "firebase/firestore";

const TERMINAL_STATUSES: AppointmentStatus[] = ["COMPLETED", "CANCELLED", "NO_SHOW"];

/** The fixed set of steps the farmer-facing timeline shows (CLAUDE.md §6). */
const TIMELINE_STATUSES: AppointmentStatus[] = [
  "SCHEDULED",
  "WAITING",
  "CALLED",
  "IN_PROGRESS",
  "COMPLETED",
];

/**
 * Filters on `farmer_id` in addition to `appointment_id` so the query's
 * equality filters match what the `status_history` security rule checks —
 * Firestore denies a list query with "Missing or insufficient permissions"
 * if the rule depends on a field the query doesn't filter on, even when
 * every individual result would pass. `orderBy` is intentionally omitted
 * (would require a composite index for no real benefit at this data
 * volume); the fixed handful of steps per appointment are sorted here.
 */
export async function getStatusHistory(appointmentId: string, farmerId: string): Promise<DemoStatusStep[]> {
  const snapshot = await getDocs(
    query(
      collection(db, "status_history"),
      where("appointment_id", "==", appointmentId),
      where("farmer_id", "==", farmerId)
    )
  );
  const entries = snapshot.docs
    .map((d) => d.data() as StatusHistoryEntry)
    .sort((a, b) => (a.created_at?.toMillis() ?? 0) - (b.created_at?.toMillis() ?? 0));

  return TIMELINE_STATUSES.map((status) => {
    const entry = entries.find((e) => e.new_status === status);
    return { status, timestamp: formatTimestampLabel(entry?.created_at) };
  });
}

/**
 * Raw WAITING/CALLED timestamps for one appointment (used to compute wait
 * duration in services/admin.ts — `getStatusHistory` above returns display
 * labels, not values usable for arithmetic).
 */
export async function getWaitAndCallTimestamps(
  appointmentId: string,
  farmerId: string
): Promise<{ waitingAt: Date | null; calledAt: Date | null }> {
  const snapshot = await getDocs(
    query(
      collection(db, "status_history"),
      where("appointment_id", "==", appointmentId),
      where("farmer_id", "==", farmerId)
    )
  );
  const entries = snapshot.docs.map((d) => d.data() as StatusHistoryEntry);
  const waiting = entries.find((e) => e.new_status === "WAITING");
  const called = entries.find((e) => e.new_status === "CALLED");
  return {
    waitingAt: waiting?.created_at ? waiting.created_at.toDate() : null,
    calledAt: called?.created_at ? called.created_at.toDate() : null,
  };
}

/**
 * Batch lookup of when each appointment actually reached its terminal
 * status — used by the officer history page (CLAUDE.md §24
 * `/officer/history`) instead of the appointment's own `updated_at`, which
 * the seed script always stamps as "now" regardless of a backfilled demo
 * record's fictional date (CLAUDE.md §33). Chunked to Firestore's `in`
 * operator limit. Appointments with no matching entry (e.g. seeded queue
 * items that were never given a full status_history backfill) are simply
 * absent from the returned map — the caller falls back to `updated_at`.
 */
export async function getTerminalStatusTimestamps(
  appointmentIds: string[]
): Promise<Map<string, Timestamp>> {
  const result = new Map<string, Timestamp>();
  if (appointmentIds.length === 0) return result;

  const chunks: string[][] = [];
  for (let i = 0; i < appointmentIds.length; i += 30) {
    chunks.push(appointmentIds.slice(i, i + 30));
  }

  await Promise.all(
    chunks.map(async (chunk) => {
      const snapshot = await getDocs(
        query(collection(db, "status_history"), where("appointment_id", "in", chunk))
      );
      for (const doc of snapshot.docs) {
        const entry = doc.data() as StatusHistoryEntry;
        if (!TERMINAL_STATUSES.includes(entry.new_status)) continue;
        const existing = result.get(entry.appointment_id);
        if (!existing || entry.created_at.toMillis() > existing.toMillis()) {
          result.set(entry.appointment_id, entry.created_at);
        }
      }
    })
  );

  return result;
}

export async function recordStatusChange(
  appointmentId: string,
  farmerId: string,
  oldStatus: AppointmentStatus | null,
  newStatus: AppointmentStatus,
  changedBy: string,
  note: string | null = null
): Promise<void> {
  await addDoc(collection(db, "status_history"), {
    appointment_id: appointmentId,
    farmer_id: farmerId,
    old_status: oldStatus,
    new_status: newStatus,
    changed_by: changedBy,
    note,
    created_at: serverTimestamp(),
  });
}
