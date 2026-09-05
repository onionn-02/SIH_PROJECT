import {
  collection,
  doc,
  getDocs,
  query,
  runTransaction,
  serverTimestamp,
  Timestamp,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase/client";
import { formatTimeLabel } from "@/lib/format/datetime";
import type { Appointment, AppointmentStatus, ProcurementSchedule } from "@/types/firestore";

export interface BookSlotInput {
  scheduleId: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
}

export interface BookSlotResult {
  appointmentId: string;
  tokenNumber: string;
}

const NON_BLOCKING_STATUSES: AppointmentStatus[] = ["CANCELLED", "NO_SHOW"];

function parseTimeToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

/** The `bookedIndex`th (0-based) slot's start time within the schedule's window, spread evenly across capacity. */
function slotTime(schedule: ProcurementSchedule, bookedIndex: number): Date {
  const [y, mo, d] = schedule.date.split("-").map(Number);
  const startMinutes = parseTimeToMinutes(schedule.start_time);
  const endMinutes = parseTimeToMinutes(schedule.end_time);
  const slotLength = schedule.capacity > 0 ? (endMinutes - startMinutes) / schedule.capacity : 0;
  const date = new Date(y, mo - 1, d);
  date.setHours(0, 0, 0, 0);
  date.setMinutes(startMinutes + Math.round(slotLength * bookedIndex));
  return date;
}

function tokenPrefix(commodity: string): string {
  const letters = commodity.toUpperCase().replace(/[^A-Z]/g, "");
  return (letters || "GEN").slice(0, 3);
}

/**
 * Self-service booking (CLAUDE.md §5 booking step): a farmer picks a
 * published schedule and this atomically creates their appointment, bumps
 * the schedule's `booked_count`, writes the initial "Scheduled" audit
 * entry, and notifies them — all in one transaction so nothing is left
 * half-applied (same pattern as transitionAppointmentStatus in
 * services/appointments.ts). Firestore rules re-check every one of these
 * writes independently (firestore.rules) — this function can never grant
 * more than what a farmer is already allowed to do to their own data.
 */
export async function bookAppointment(input: BookSlotInput): Promise<BookSlotResult> {
  const existing = await getDocs(
    query(
      collection(db, "appointments"),
      where("schedule_id", "==", input.scheduleId),
      where("farmer_id", "==", input.farmerId)
    )
  );
  const alreadyBooked = existing.docs.some(
    (d) => !NON_BLOCKING_STATUSES.includes((d.data() as Appointment).status)
  );
  if (alreadyBooked) {
    throw new Error("You already have an appointment on this schedule.");
  }

  const scheduleRef = doc(db, "procurement_schedules", input.scheduleId);
  const appointmentRef = doc(collection(db, "appointments"));

  return runTransaction(db, async (tx) => {
    const scheduleSnap = await tx.get(scheduleRef);
    if (!scheduleSnap.exists()) throw new Error("This schedule no longer exists.");
    const schedule = scheduleSnap.data() as ProcurementSchedule;

    if (schedule.status !== "published") {
      throw new Error("This schedule is no longer open for booking.");
    }
    const bookedCount = schedule.booked_count ?? 0;
    if (bookedCount >= schedule.capacity) {
      throw new Error("This schedule is fully booked.");
    }

    const newBookedCount = bookedCount + 1;
    const tokenNumber = `${tokenPrefix(schedule.commodity)}-${String(newBookedCount).padStart(3, "0")}`;
    const appointmentTime = slotTime(schedule, bookedCount);
    const now = serverTimestamp();

    tx.update(scheduleRef, { booked_count: newBookedCount, updated_at: now });

    tx.set(appointmentRef, {
      farmer_id: input.farmerId,
      farmer_name: input.farmerName,
      farmer_phone: input.farmerPhone,
      schedule_id: input.scheduleId,
      center_id: schedule.center_id,
      commodity: schedule.commodity,
      date: schedule.date,
      token_number: tokenNumber,
      appointment_time: Timestamp.fromDate(appointmentTime),
      time_label: formatTimeLabel(appointmentTime),
      status: "SCHEDULED" satisfies AppointmentStatus,
      queue_position: null,
      notes: null,
      payment_status: null,
      created_at: now,
      updated_at: now,
    });

    tx.set(doc(collection(db, "status_history")), {
      appointment_id: appointmentRef.id,
      farmer_id: input.farmerId,
      old_status: null,
      new_status: "SCHEDULED" satisfies AppointmentStatus,
      changed_by: input.farmerId,
      note: null,
      created_at: now,
    });

    tx.set(doc(collection(db, "notifications")), {
      user_id: input.farmerId,
      title: "Appointment confirmed",
      message: `Your ${schedule.commodity} appointment (Token ${tokenNumber}) is confirmed.`,
      type: "APPOINTMENT_CONFIRMED",
      read_at: null,
      created_at: now,
      push_sent: false,
    });

    return { appointmentId: appointmentRef.id, tokenNumber };
  });
}
