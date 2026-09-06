import {
  collection,
  doc,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase/client";
import { formatDateLabel, formatTimestampLabel } from "@/lib/format/datetime";
import { withQueuePositions } from "@/lib/queue/positions";
import { getAllCenters, getCenter } from "@/services/centers";
import { getRecordedQuantity } from "@/services/procurement-records";
import { getStatusHistory, getTerminalStatusTimestamps } from "@/services/status-history";
import { isValidStatusTransition } from "@/lib/validation/status-transitions";
import type { DemoAppointment, DemoCenter } from "@/lib/demo/types";
import type { Appointment, AppointmentStatus, NotificationType } from "@/types/firestore";

export interface QueueEntry {
  id: string;
  tokenNumber: string;
  farmerName: string;
  farmerPhone: string;
  commodity: string;
  timeSlot: string;
  status: AppointmentStatus;
  queuePosition: number | null;
  centerId: string;
  centerName: string;
  /** Raw sort key — `timeSlot` is a formatted string and doesn't sort correctly across centers. */
  appointmentTimeMillis: number;
}

const COMMODITY_INSTRUCTIONS: Record<string, string[]> = {
  default: [
    "Arrive at least 15 minutes before your queue position is called.",
    "Bring your Farmer ID card and land record extract (7/12).",
    "Bring the produce in labelled bags for weighing.",
  ],
};

function instructionsFor(status: AppointmentStatus): string[] {
  if (status === "COMPLETED" || status === "CANCELLED" || status === "NO_SHOW") return [];
  return COMMODITY_INSTRUCTIONS.default;
}

const FALLBACK_CENTER: DemoCenter = {
  id: "",
  name: "Procurement Center",
  address: "",
  district: "",
  state: "",
  contactPhone: "",
  operatingHours: "",
};

const centerCache = new Map<string, DemoCenter>();

async function cachedCenter(centerId: string): Promise<DemoCenter> {
  const cached = centerCache.get(centerId);
  if (cached) return cached;
  const center = (await getCenter(centerId)) ?? { ...FALLBACK_CENTER, id: centerId };
  centerCache.set(centerId, center);
  return center;
}

async function toDemoAppointment(id: string, data: Appointment): Promise<DemoAppointment> {
  const [center, statusHistory, quantity] = await Promise.all([
    cachedCenter(data.center_id),
    getStatusHistory(id, data.farmer_id),
    ["COMPLETED", "CANCELLED", "NO_SHOW"].includes(data.status)
      ? getRecordedQuantity(id, data.farmer_id)
      : Promise.resolve(null),
  ]);

  return {
    id,
    tokenNumber: data.token_number,
    farmerName: data.farmer_name,
    center,
    commodity: data.commodity,
    date: data.date,
    dateLabel: formatDateLabel(data.date),
    timeSlot: data.time_label,
    status: data.status,
    queuePosition: null,
    paymentStatus: data.payment_status,
    quantity,
    instructions: instructionsFor(data.status),
    cancellationReason: data.status === "CANCELLED" ? data.notes : null,
    statusHistory,
  };
}

/**
 * Live view of every appointment for one farmer. Firestore has no
 * "recompute derived fields on read" — each snapshot re-enriches with
 * center/history/quantity, which is fine at this demo's data volume
 * (CLAUDE.md §32 — avoid overengineering for scale this app doesn't have).
 */
export function subscribeFarmerAppointments(
  farmerId: string,
  onData: (appointments: DemoAppointment[]) => void,
  onError: (error: Error) => void
): () => void {
  const q = query(collection(db, "appointments"), where("farmer_id", "==", farmerId));
  return onSnapshot(
    q,
    async (snapshot) => {
      try {
        const appointments = await Promise.all(
          snapshot.docs.map((d) => toDemoAppointment(d.id, d.data() as Appointment))
        );
        onData(appointments);
      } catch (err) {
        onError(err instanceof Error ? err : new Error("Failed to load appointments."));
      }
    },
    (err) => onError(err)
  );
}

/**
 * Live queue across one or more centers on one date, grouped by center then
 * appointment time. An officer can be assigned multiple centers (CLAUDE.md
 * §11 "center(s)"), so this runs one listener per center — queue position
 * is inherently a per-location concept ("your place in line at *this*
 * center"), so `withQueuePositions` is applied to each center's own WAITING
 * subset before the results are merged, never across centers combined.
 *
 * `orderBy` is intentionally left off each center's query (it would require
 * a composite index alongside the two equality filters, for no real benefit
 * at this data volume) — each center's snapshot is sorted client-side.
 */
export function subscribeCenterQueue(
  centerIds: string[],
  dateKey: string,
  onData: (queue: QueueEntry[]) => void,
  onError: (error: Error) => void
): () => void {
  if (centerIds.length === 0) {
    onData([]);
    return () => {};
  }

  const perCenterQueues = new Map<string, QueueEntry[]>();
  const unsubscribes: (() => void)[] = [];
  let stopped = false;

  function emit() {
    const combined = centerIds
      .flatMap((id) => perCenterQueues.get(id) ?? [])
      .sort((a, b) => a.centerName.localeCompare(b.centerName) || a.appointmentTimeMillis - b.appointmentTimeMillis);
    onData(combined);
  }

  getAllCenters()
    .then((centers) => {
      if (stopped) return;
      const centerNames = new Map(centers.map((c) => [c.id, c.name]));

      for (const centerId of centerIds) {
        const q = query(
          collection(db, "appointments"),
          where("center_id", "==", centerId),
          where("date", "==", dateKey)
        );
        unsubscribes.push(
          onSnapshot(
            q,
            (snapshot) => {
              const entries = snapshot.docs
                .map((d) => ({ id: d.id, data: d.data() as Appointment }))
                .sort((a, b) => a.data.appointment_time.toMillis() - b.data.appointment_time.toMillis())
                .map(({ id, data }) => ({
                  id,
                  tokenNumber: data.token_number,
                  farmerName: data.farmer_name,
                  farmerPhone: data.farmer_phone,
                  commodity: data.commodity,
                  timeSlot: data.time_label,
                  status: data.status,
                  centerId,
                  centerName: centerNames.get(centerId) ?? "Unknown center",
                  appointmentTimeMillis: data.appointment_time.toMillis(),
                }));
              perCenterQueues.set(centerId, withQueuePositions(entries));
              emit();
            },
            (err) => onError(err)
          )
        );
      }
    })
    .catch((err) => onError(err instanceof Error ? err : new Error("Failed to load centers.")));

  return () => {
    stopped = true;
    unsubscribes.forEach((unsub) => unsub());
  };
}

export interface HistoryEntry {
  id: string;
  tokenNumber: string;
  farmerName: string;
  farmerPhone: string;
  commodity: string;
  scheduledDateLabel: string;
  /** When this outcome was actually recorded (the appointment's `updated_at`) — not the originally scheduled slot time, which can be minutes or days off from when an officer actually called/completed/no-showed it. */
  recordedAtLabel: string;
  status: AppointmentStatus;
  centerId: string;
  centerName: string;
  recordedAtMillis: number;
}

const HISTORY_STATUSES: AppointmentStatus[] = ["COMPLETED", "CANCELLED", "NO_SHOW"];

/**
 * Live log of every completed/cancelled/no-show appointment across one or
 * more centers, most recent first — the officer-facing counterpart to the
 * farmer's own history page (CLAUDE.md §24 `/officer/history`). Unlike
 * `subscribeCenterQueue`, this is not scoped to today: it's the durable
 * record of what has happened at a center, not the live working queue.
 * Mirrors `subscribeCenterQueue`'s one-listener-per-center approach so each
 * query's equality/`in` filters line up with what the security rule checks.
 */
export function subscribeCenterHistory(
  centerIds: string[],
  onData: (entries: HistoryEntry[]) => void,
  onError: (error: Error) => void
): () => void {
  if (centerIds.length === 0) {
    onData([]);
    return () => {};
  }

  const perCenterHistory = new Map<string, HistoryEntry[]>();
  const unsubscribes: (() => void)[] = [];
  let stopped = false;

  function emit() {
    const combined = centerIds
      .flatMap((id) => perCenterHistory.get(id) ?? [])
      .sort((a, b) => b.recordedAtMillis - a.recordedAtMillis);
    onData(combined);
  }

  getAllCenters()
    .then((centers) => {
      if (stopped) return;
      const centerNames = new Map(centers.map((c) => [c.id, c.name]));

      for (const centerId of centerIds) {
        const q = query(
          collection(db, "appointments"),
          where("center_id", "==", centerId),
          where("status", "in", HISTORY_STATUSES)
        );
        unsubscribes.push(
          onSnapshot(
            q,
            async (snapshot) => {
              try {
                const docs = snapshot.docs.map((d) => ({ id: d.id, data: d.data() as Appointment }));
                const terminalTimestamps = await getTerminalStatusTimestamps(docs.map((d) => d.id));

                const entries = docs.map(({ id, data }) => {
                  const recordedAt = terminalTimestamps.get(id) ?? data.updated_at;
                  return {
                    id,
                    tokenNumber: data.token_number,
                    farmerName: data.farmer_name,
                    farmerPhone: data.farmer_phone,
                    commodity: data.commodity,
                    scheduledDateLabel: formatDateLabel(data.date),
                    recordedAtLabel: formatTimestampLabel(recordedAt) ?? data.time_label,
                    status: data.status,
                    centerId,
                    centerName: centerNames.get(centerId) ?? "Unknown center",
                    recordedAtMillis: recordedAt.toMillis(),
                  };
                });
                perCenterHistory.set(centerId, entries);
                emit();
              } catch (err) {
                onError(err instanceof Error ? err : new Error("Failed to load history."));
              }
            },
            (err) => onError(err)
          )
        );
      }
    })
    .catch((err) => onError(err instanceof Error ? err : new Error("Failed to load centers.")));

  return () => {
    stopped = true;
    unsubscribes.forEach((unsub) => unsub());
  };
}

interface NotificationCopy {
  title: string;
  message: (data: Appointment) => string;
  type: NotificationType;
}

const TRANSITION_NOTIFICATIONS: Partial<Record<AppointmentStatus, NotificationCopy>> = {
  CALLED: {
    title: "You're being called",
    message: (data) => `Token ${data.token_number} — please proceed to the counter now.`,
    type: "STATUS_UPDATE",
  },
  IN_PROGRESS: {
    title: "Procurement started",
    message: (data) => `Your ${data.commodity} procurement (Token ${data.token_number}) has started.`,
    type: "STATUS_UPDATE",
  },
  COMPLETED: {
    title: "Procurement completed",
    message: (data) => `Your ${data.commodity} procurement (Token ${data.token_number}) was completed.`,
    type: "PROCUREMENT_COMPLETED",
  },
  CANCELLED: {
    title: "Appointment cancelled",
    message: (data) => `Your appointment for Token ${data.token_number} was cancelled.`,
    type: "APPOINTMENT_CHANGED",
  },
  NO_SHOW: {
    title: "Marked as no-show",
    message: (data) =>
      `You were marked as a no-show for Token ${data.token_number}. Contact your center to reschedule.`,
    type: "STATUS_UPDATE",
  },
};

/**
 * Atomically moves an appointment to a new status, writes the audit trail
 * entry, creates the procurement record on completion, and notifies the
 * farmer — all in one transaction so the UI never observes a half-applied
 * change (CLAUDE.md §5, §10).
 */
export async function transitionAppointmentStatus(
  appointmentId: string,
  toStatus: AppointmentStatus,
  changedByUid: string
): Promise<void> {
  const appointmentRef = doc(db, "appointments", appointmentId);

  await runTransaction(db, async (tx) => {
    const snapshot = await tx.get(appointmentRef);
    if (!snapshot.exists()) throw new Error("Appointment not found.");
    const data = snapshot.data() as Appointment;

    if (!isValidStatusTransition(data.status, toStatus)) {
      throw new Error(`Cannot move an appointment from ${data.status} to ${toStatus}.`);
    }

    tx.update(appointmentRef, { status: toStatus, updated_at: serverTimestamp() });

    tx.set(doc(collection(db, "status_history")), {
      appointment_id: appointmentId,
      farmer_id: data.farmer_id,
      old_status: data.status,
      new_status: toStatus,
      changed_by: changedByUid,
      note: null,
      created_at: serverTimestamp(),
    });

    if (toStatus === "COMPLETED") {
      tx.set(doc(collection(db, "procurement_records")), {
        appointment_id: appointmentId,
        farmer_id: data.farmer_id,
        center_id: data.center_id,
        commodity: data.commodity,
        quantity: null,
        completed_at: serverTimestamp(),
        officer_id: changedByUid,
        remarks: null,
        created_at: serverTimestamp(),
      });
    }

    const copy = TRANSITION_NOTIFICATIONS[toStatus];
    if (copy) {
      tx.set(doc(collection(db, "notifications")), {
        user_id: data.farmer_id,
        title: copy.title,
        message: copy.message(data),
        type: copy.type,
        read_at: null,
        created_at: serverTimestamp(),
        push_sent: false,
      });
    }
  });
}
