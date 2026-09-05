import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";

import { db } from "@/lib/firebase/client";
import { formatDateLabel, todayDateKey } from "@/lib/format/datetime";
import { getAllCenters } from "@/services/centers";
import type { AdminSchedule, BookableSchedule } from "@/lib/demo/types";
import type { Appointment, AppointmentStatus, ProcurementSchedule, ScheduleStatus } from "@/types/firestore";

/** Statuses a cancelled schedule's appointments can still be moved out of (CLAUDE.md §5). */
const CANCELLABLE_STATUSES: AppointmentStatus[] = ["SCHEDULED", "WAITING", "CALLED", "IN_PROGRESS"];

/**
 * Live list of every schedule, newest date first, with the center name
 * joined in client-side (Firestore has no server-side joins — same
 * approach as `toDemoAppointment` in services/appointments.ts).
 */
export function subscribeSchedules(
  onData: (schedules: AdminSchedule[]) => void,
  onError: (error: Error) => void
): () => void {
  return onSnapshot(
    collection(db, "procurement_schedules"),
    async (snapshot) => {
      try {
        const centers = await getAllCenters();
        const centerNames = new Map(centers.map((c) => [c.id, c.name]));
        const schedules = snapshot.docs
          .map((d) => {
            const data = d.data() as ProcurementSchedule;
            return {
              id: d.id,
              centerId: data.center_id,
              centerName: centerNames.get(data.center_id) ?? "Unknown center",
              date: data.date,
              dateLabel: formatDateLabel(data.date),
              startTime: data.start_time,
              endTime: data.end_time,
              commodity: data.commodity,
              capacity: data.capacity,
              bookedCount: data.booked_count ?? 0,
              status: data.status,
              notes: data.notes,
            } satisfies AdminSchedule;
          })
          .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
        onData(schedules);
      } catch (err) {
        onError(err instanceof Error ? err : new Error("Failed to load schedules."));
      }
    },
    (err) => onError(err)
  );
}

/**
 * Live list of schedules a farmer can self-book: published, today or later,
 * and not yet full (CLAUDE.md §5 booking step). Filtered/sorted client-side
 * rather than with extra `where` clauses — same "no composite index for one
 * cheap in-memory filter" convention as subscribeSchedules above.
 */
export function subscribeBookableSchedules(
  onData: (schedules: BookableSchedule[]) => void,
  onError: (error: Error) => void
): () => void {
  const q = query(collection(db, "procurement_schedules"), where("status", "==", "published"));
  return onSnapshot(
    q,
    async (snapshot) => {
      try {
        const centers = await getAllCenters();
        const centerNames = new Map(centers.map((c) => [c.id, c.name]));
        const today = todayDateKey();
        const schedules = snapshot.docs
          .map((d) => {
            const data = d.data() as ProcurementSchedule;
            const bookedCount = data.booked_count ?? 0;
            return {
              id: d.id,
              centerId: data.center_id,
              centerName: centerNames.get(data.center_id) ?? "Unknown center",
              date: data.date,
              dateLabel: formatDateLabel(data.date),
              startTime: data.start_time,
              endTime: data.end_time,
              commodity: data.commodity,
              capacity: data.capacity,
              bookedCount,
              slotsRemaining: Math.max(0, data.capacity - bookedCount),
            } satisfies BookableSchedule;
          })
          .filter((s) => s.date >= today && s.slotsRemaining > 0)
          .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime));
        onData(schedules);
      } catch (err) {
        onError(err instanceof Error ? err : new Error("Failed to load available schedules."));
      }
    },
    (err) => onError(err)
  );
}

export interface ScheduleInput {
  centerId: string;
  date: string;
  startTime: string;
  endTime: string;
  commodity: string;
  capacity: number;
  notes: string | null;
}

export async function createSchedule(input: ScheduleInput): Promise<void> {
  const now = serverTimestamp();
  await addDoc(collection(db, "procurement_schedules"), {
    center_id: input.centerId,
    date: input.date,
    start_time: input.startTime,
    end_time: input.endTime,
    commodity: input.commodity,
    capacity: input.capacity,
    booked_count: 0,
    status: "draft" satisfies ScheduleStatus,
    notes: input.notes,
    created_at: now,
    updated_at: now,
  });
}

export async function updateSchedule(
  scheduleId: string,
  updates: Partial<ScheduleInput>
): Promise<void> {
  const data: Record<string, unknown> = { updated_at: serverTimestamp() };
  if (updates.centerId !== undefined) data.center_id = updates.centerId;
  if (updates.date !== undefined) data.date = updates.date;
  if (updates.startTime !== undefined) data.start_time = updates.startTime;
  if (updates.endTime !== undefined) data.end_time = updates.endTime;
  if (updates.commodity !== undefined) data.commodity = updates.commodity;
  if (updates.capacity !== undefined) data.capacity = updates.capacity;
  if (updates.notes !== undefined) data.notes = updates.notes;
  await updateDoc(doc(db, "procurement_schedules", scheduleId), data);
}

export async function publishSchedule(scheduleId: string): Promise<void> {
  await updateDoc(doc(db, "procurement_schedules", scheduleId), {
    status: "published" satisfies ScheduleStatus,
    updated_at: serverTimestamp(),
  });
}

/**
 * Cancels a schedule and cascades the cancellation to every appointment
 * still in a pre-completion state (CLAUDE.md §9 "view affected
 * appointments", §5 status workflow): each moves to CANCELLED with an audit
 * trail entry, and the farmer is notified. A batched write is used instead
 * of a transaction because Firestore transactions can't run queries — only
 * document reads (see the "no composite index" convention already used in
 * services/appointments.ts for why the query itself has no orderBy).
 */
export async function cancelSchedule(scheduleId: string, changedByUid: string): Promise<number> {
  const appointmentsSnapshot = await getDocs(
    query(collection(db, "appointments"), where("schedule_id", "==", scheduleId))
  );

  const affected = appointmentsSnapshot.docs
    .map((d) => ({ id: d.id, data: d.data() as Appointment }))
    .filter(({ data }) => CANCELLABLE_STATUSES.includes(data.status));

  const batch = writeBatch(db);
  const now = serverTimestamp();

  batch.update(doc(db, "procurement_schedules", scheduleId), {
    status: "cancelled" satisfies ScheduleStatus,
    updated_at: now,
  });

  for (const { id, data } of affected) {
    batch.update(doc(db, "appointments", id), { status: "CANCELLED", updated_at: now });
    batch.set(doc(collection(db, "status_history")), {
      appointment_id: id,
      farmer_id: data.farmer_id,
      old_status: data.status,
      new_status: "CANCELLED",
      changed_by: changedByUid,
      note: "Schedule was cancelled by the administrator.",
      created_at: now,
    });
    batch.set(doc(collection(db, "notifications")), {
      user_id: data.farmer_id,
      title: "Your appointment was cancelled",
      message: `The ${data.commodity} schedule for Token ${data.token_number} was cancelled by the procurement center. Please check for a new schedule.`,
      type: "SCHEDULE_CANCELLED",
      read_at: null,
      created_at: now,
      push_sent: false,
    });
  }

  await batch.commit();
  return affected.length;
}
