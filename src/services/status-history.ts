import { addDoc, collection, getDocs, query, serverTimestamp, where } from "firebase/firestore";

import { formatTimestampLabel } from "@/lib/format/datetime";
import { db } from "@/lib/firebase/client";
import type { DemoStatusStep } from "@/lib/demo/types";
import type { AppointmentStatus, StatusHistoryEntry } from "@/types/firestore";

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
