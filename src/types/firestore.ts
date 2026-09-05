/**
 * Firestore collection/document schema plan (CLAUDE.md §10).
 * These types describe the Day 1 data model. Live reads/writes are
 * implemented starting Day 4 once Firebase Authentication and Security
 * Rules are wired up.
 */
import type { Timestamp } from "firebase/firestore";

export type UserRole = "farmer" | "officer" | "admin";

/** profiles/{uid} — keyed by Firebase Authentication UID */
export interface Profile {
  full_name: string;
  phone: string;
  role: UserRole;
  preferred_language: "en" | "hi" | "mr";
  /** Officers only — the center(s) they manage the queue for (CLAUDE.md §11). Empty for farmers/admins. */
  assigned_center_ids: string[];
  created_at: Timestamp;
  updated_at: Timestamp;
}

/** procurement_centers/{centerId} */
export interface ProcurementCenter {
  name: string;
  code: string;
  address: string;
  district: string;
  state: string;
  latitude: number | null;
  longitude: number | null;
  contact_phone: string;
  operating_start: string; // "HH:mm"
  operating_end: string; // "HH:mm"
  active: boolean;
  created_at: Timestamp;
  updated_at: Timestamp;
}

export type ScheduleStatus = "draft" | "published" | "cancelled";

/** procurement_schedules/{scheduleId} */
export interface ProcurementSchedule {
  center_id: string;
  date: string; // "YYYY-MM-DD"
  start_time: string; // "HH:mm"
  end_time: string; // "HH:mm"
  commodity: string;
  capacity: number;
  /** How many farmers have self-booked a slot on this schedule (CLAUDE.md §5 booking step). */
  booked_count: number;
  status: ScheduleStatus;
  notes: string | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

/**
 * Valid appointment status workflow (CLAUDE.md §5):
 * SCHEDULED -> WAITING -> CALLED -> IN_PROGRESS -> COMPLETED
 * WAITING -> NO_SHOW, and CANCELLED from applicable pre-completion states.
 */
export type AppointmentStatus =
  | "SCHEDULED"
  | "WAITING"
  | "CALLED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export type PaymentStatus = "PENDING" | "PAID" | "FAILED";

/**
 * appointments/{appointmentId}
 *
 * Firestore has no server-side joins, so `center_id`, `date`, `time_label`,
 * `commodity`, `farmer_name` and `farmer_phone` are copied from the parent
 * schedule/profile at booking time. This lets the officer queue query
 * "today's appointments at my center" directly, and lets the UI render a
 * farmer's name without every officer needing read access to every farmer's
 * profile. `queue_position` is intentionally left unused — position is
 * always derived client-side from WAITING order (CLAUDE.md §18) so it can
 * never drift out of sync with the real queue.
 */
export interface Appointment {
  farmer_id: string;
  farmer_name: string;
  farmer_phone: string;
  schedule_id: string;
  center_id: string;
  commodity: string;
  date: string; // "YYYY-MM-DD", copied from the schedule
  token_number: string;
  appointment_time: Timestamp;
  time_label: string; // e.g. "10:30 AM"
  status: AppointmentStatus;
  queue_position: number | null;
  notes: string | null;
  payment_status: PaymentStatus | null;
  created_at: Timestamp;
  updated_at: Timestamp;
}

/** procurement_records/{recordId} */
export interface ProcurementRecord {
  appointment_id: string;
  farmer_id: string;
  center_id: string;
  commodity: string;
  quantity: number | null;
  completed_at: Timestamp;
  officer_id: string;
  remarks: string | null;
  created_at: Timestamp;
}

export type NotificationType =
  | "APPOINTMENT_CONFIRMED"
  | "APPOINTMENT_CHANGED"
  | "STATUS_UPDATE"
  | "PROCUREMENT_COMPLETED"
  | "SCHEDULE_CANCELLED"
  | "CENTER_ANNOUNCEMENT";

/** notifications/{notificationId} */
export interface AppNotification {
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  read_at: Timestamp | null;
  created_at: Timestamp;
  push_sent: boolean;
}

/** status_history/{historyId} — audit trail for appointment status changes */
export interface StatusHistoryEntry {
  appointment_id: string;
  farmer_id: string;
  old_status: AppointmentStatus | null;
  new_status: AppointmentStatus;
  changed_by: string;
  note: string | null;
  created_at: Timestamp;
}

/**
 * payments/{paymentId} — only used when the payment step (CLAUDE.md §17A)
 * is enabled. Demo/mock unless a real gateway is explicitly configured.
 */
export interface Payment {
  appointment_id: string;
  farmer_id: string;
  amount: number;
  status: PaymentStatus;
  reference: string;
  paid_at: Timestamp | null;
  created_at: Timestamp;
}

export interface FirestoreCollections {
  profiles: Profile;
  procurement_centers: ProcurementCenter;
  procurement_schedules: ProcurementSchedule;
  appointments: Appointment;
  procurement_records: ProcurementRecord;
  notifications: AppNotification;
  status_history: StatusHistoryEntry;
  payments: Payment;
}
