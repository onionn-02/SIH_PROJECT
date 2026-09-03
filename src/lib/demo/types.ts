/**
 * View-model types for Day 2 demo/seed data (CLAUDE.md §21, §33).
 * These mirror the Firestore schema in src/types/firestore.ts but use
 * plain strings instead of Firestore Timestamps, since the app is not
 * yet connected to a live database (real Firebase reads/writes land Day 4).
 */
import type {
  AppointmentStatus,
  NotificationType,
  PaymentStatus,
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
