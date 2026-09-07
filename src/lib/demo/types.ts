/**
 * View-model types for Day 2 demo/seed data (CLAUDE.md §21, §33).
 * These mirror the Firestore schema in src/types/firestore.ts but use
 * plain strings instead of Firestore Timestamps, since the app is not
 * yet connected to a live database (real Firebase reads/writes land Day 4).
 */
import type {
  AppointmentStatus,
  CropCategory,
  NotificationType,
  PaymentStatus,
  PriceUnit,
  ScheduleStatus,
  UserRole,
} from "@/types/firestore";

export interface DemoCenter {
  id: string;
  name: string;
  address: string;
  district: string;
  state: string;
  contactPhone: string;
  operatingHours: string;
}

export interface DemoStatusStep {
  status: AppointmentStatus;
  /** ISO-ish display string, e.g. "Today, 9:40 AM". Null if not reached yet. */
  timestamp: string | null;
  note?: string;
}

export interface DemoAppointment {
  id: string;
  tokenNumber: string;
  farmerName: string;
  center: DemoCenter;
  commodity: string;
  date: string;
  dateLabel: string;
  timeSlot: string;
  status: AppointmentStatus;
  queuePosition: number | null;
  paymentStatus: PaymentStatus | null;
  quantity: number | null;
  instructions: string[];
  cancellationReason: string | null;
  statusHistory: DemoStatusStep[];
}

export interface DemoNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  createdAtLabel: string;
  read: boolean;
}

/**
 * Admin-facing view model for a procurement center (CLAUDE.md §9, Day 5).
 * Unlike `DemoCenter` (the farmer/officer-facing shape), this exposes the
 * raw editable fields and the `active` flag the admin panel manages.
 */
export interface AdminCenter {
  id: string;
  name: string;
  code: string;
  address: string;
  district: string;
  state: string;
  contactPhone: string;
  operatingStart: string;
  operatingEnd: string;
  active: boolean;
}

/** Admin-facing view model for a procurement schedule (CLAUDE.md §9, Day 5). */
export interface AdminSchedule {
  id: string;
  centerId: string;
  centerName: string;
  date: string;
  dateLabel: string;
  startTime: string;
  endTime: string;
  commodity: string;
  capacity: number;
  bookedCount: number;
  status: ScheduleStatus;
  notes: string | null;
}

/** Admin-facing view model for a user profile (CLAUDE.md §9 User Management, Day 7). */
export interface AdminUser {
  id: string;
  fullName: string;
  phone: string;
  role: UserRole;
  assignedCenterIds: string[];
}

/**
 * Farmer-facing view model for a schedule open to self-booking
 * (CLAUDE.md §5 booking step, Day 7). Only published, non-full,
 * today-or-later schedules are surfaced this way.
 */
export interface BookableSchedule {
  id: string;
  centerId: string;
  centerName: string;
  date: string;
  dateLabel: string;
  startTime: string;
  endTime: string;
  commodity: string;
  capacity: number;
  bookedCount: number;
  slotsRemaining: number;
}

/**
 * View model for a crop's current procurement rate ("Crop Prices &
 * Procurement Rates" module). Used both read-only (farmer) and as the row
 * shape in the officer/admin management table.
 */
export interface MarketPrice {
  id: string;
  cropName: string;
  category: CropCategory;
  unit: PriceUnit;
  price: number;
  previousPrice: number | null;
  centerId: string | null;
  /** Null when this price applies state-wide (every center). */
  centerName: string | null;
  /** Raw "YYYY-MM-DD", suitable for an `<input type="date">` when editing. */
  effectiveDate: string;
  effectiveDateLabel: string;
  updatedAtLabel: string;
  updatedByName: string;
  updatedByRole: "officer" | "admin";
}

/** One entry in the crop-price audit trail. */
export interface PriceHistoryItem {
  id: string;
  cropName: string;
  unit: PriceUnit;
  previousPrice: number | null;
  newPrice: number;
  centerName: string | null;
  changedByName: string;
  changedByRole: "officer" | "admin";
  changedAtLabel: string;
}
