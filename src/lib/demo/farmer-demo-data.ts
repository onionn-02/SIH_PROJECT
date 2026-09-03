/**
 * Fictional demo/seed data for the Day 2 farmer experience (CLAUDE.md §21, §33).
 * All names, phone numbers and records below are made up for demonstration
 * purposes only. Real Firestore reads/writes replace this module on Day 4.
 */
import type { DemoAppointment, DemoCenter, DemoNotification } from "./types";

export const DEMO_FARMER_NAME = "Ramesh Patil";

const nashikCenter: DemoCenter = {
  id: "center-nashik-01",
  name: "Nashik Krishi Mandi Procurement Center",
  address: "Gate No. 3, APMC Yard, Panchavati",
  district: "Nashik",
  state: "Maharashtra",
  contactPhone: "+91 98230 11223",
  operatingHours: "8:00 AM – 5:00 PM",
};

const puneCenter: DemoCenter = {
  id: "center-pune-02",
  name: "Pune Rural Procurement Center",
  address: "Plot 12, MSAMB Complex, Hadapsar",
  district: "Pune",
  state: "Maharashtra",
  contactPhone: "+91 98220 55667",
  operatingHours: "8:00 AM – 6:00 PM",
};

/**
 * Every appointment for the hero demo farmer, upcoming and past.
 * "today" is treated as 2026-09-04 for display labels below.
 */
export const DEMO_APPOINTMENTS: DemoAppointment[] = [
  {
    id: "a104",
    tokenNumber: "A104",
    farmerName: DEMO_FARMER_NAME,
    center: nashikCenter,
    commodity: "Onion",
    date: "2026-09-04",
    dateLabel: "Today, 4 Sep 2026",
    timeSlot: "10:30 AM",
    status: "WAITING",
    queuePosition: 3,
    paymentStatus: "PENDING",
    quantity: null,
    instructions: [
      "Arrive at least 15 minutes before your queue position is called.",
      "Bring your Farmer ID card and land record extract (7/12).",
      "Bring the produce in labelled bags for weighing.",
    ],
    cancellationReason: null,
    statusHistory: [
      { status: "SCHEDULED", timestamp: "2 Sep 2026, 6:10 PM" },
      { status: "WAITING", timestamp: "Today, 9:40 AM" },
      { status: "CALLED", timestamp: null },
      { status: "IN_PROGRESS", timestamp: null },
      { status: "COMPLETED", timestamp: null },
    ],
  },
  {
    id: "b210",
    tokenNumber: "B210",
    farmerName: DEMO_FARMER_NAME,
    center: puneCenter,
    commodity: "Soybean",
    date: "2026-09-09",
    dateLabel: "9 Sep 2026",
    timeSlot: "9:00 AM",
    status: "SCHEDULED",
    queuePosition: null,
    paymentStatus: null,
    quantity: null,
    instructions: [
      "Your token will be confirmed the evening before this appointment.",
      "Bring your Farmer ID card and land record extract (7/12).",
    ],
    cancellationReason: null,
    statusHistory: [
      { status: "SCHEDULED", timestamp: "1 Sep 2026, 11:20 AM" },
      { status: "WAITING", timestamp: null },
      { status: "CALLED", timestamp: null },
      { status: "IN_PROGRESS", timestamp: null },
      { status: "COMPLETED", timestamp: null },
    ],
  },
  {
    id: "c088",
    tokenNumber: "C088",
    farmerName: DEMO_FARMER_NAME,
    center: nashikCenter,
    commodity: "Onion",
    date: "2026-08-23",
    dateLabel: "23 Aug 2026",
    timeSlot: "11:00 AM",
    status: "COMPLETED",
    queuePosition: null,
    paymentStatus: "PAID",
    quantity: 480,
    instructions: [],
    cancellationReason: null,
    statusHistory: [
      { status: "SCHEDULED", timestamp: "20 Aug 2026, 5:00 PM" },
      { status: "WAITING", timestamp: "23 Aug 2026, 10:45 AM" },
      { status: "CALLED", timestamp: "23 Aug 2026, 11:02 AM" },
      { status: "IN_PROGRESS", timestamp: "23 Aug 2026, 11:10 AM" },
      { status: "COMPLETED", timestamp: "23 Aug 2026, 11:40 AM" },
    ],
  },
  {
    id: "d045",
    tokenNumber: "D045",
    farmerName: DEMO_FARMER_NAME,
    center: puneCenter,
    commodity: "Soybean",
    date: "2026-08-14",
    dateLabel: "14 Aug 2026",
    timeSlot: "2:00 PM",
    status: "NO_SHOW",
    queuePosition: null,
    paymentStatus: null,
    quantity: null,
    instructions: [],
    cancellationReason: null,
    statusHistory: [
      { status: "SCHEDULED", timestamp: "10 Aug 2026, 4:30 PM" },
      { status: "WAITING", timestamp: "14 Aug 2026, 1:50 PM" },
      { status: "CALLED", timestamp: null },
      { status: "IN_PROGRESS", timestamp: null },
      { status: "COMPLETED", timestamp: null },
    ],
  },
  {
    id: "e199",
    tokenNumber: "E199",
    farmerName: DEMO_FARMER_NAME,
    center: nashikCenter,
    commodity: "Onion",
    date: "2026-08-09",
    dateLabel: "9 Aug 2026",
    timeSlot: "9:30 AM",
    status: "CANCELLED",
    queuePosition: null,
    paymentStatus: null,
    quantity: null,
    instructions: [],
    cancellationReason: "Center closed for maintenance work.",
    statusHistory: [
      { status: "SCHEDULED", timestamp: "5 Aug 2026, 3:15 PM" },
      { status: "WAITING", timestamp: null },
      { status: "CALLED", timestamp: null },
      { status: "IN_PROGRESS", timestamp: null },
      { status: "COMPLETED", timestamp: null },
    ],
  },
  {
    id: "f156",
    tokenNumber: "F156",
    farmerName: DEMO_FARMER_NAME,
    center: puneCenter,
    commodity: "Wheat",
    date: "2026-07-28",
    dateLabel: "28 Jul 2026",
    timeSlot: "10:00 AM",
    status: "COMPLETED",
    queuePosition: null,
    paymentStatus: "PAID",
    quantity: 620,
    instructions: [],
    cancellationReason: null,
    statusHistory: [
      { status: "SCHEDULED", timestamp: "24 Jul 2026, 6:00 PM" },
      { status: "WAITING", timestamp: "28 Jul 2026, 9:40 AM" },
      { status: "CALLED", timestamp: "28 Jul 2026, 10:05 AM" },
      { status: "IN_PROGRESS", timestamp: "28 Jul 2026, 10:12 AM" },
      { status: "COMPLETED", timestamp: "28 Jul 2026, 10:50 AM" },
    ],
  },
];

const UPCOMING_STATUSES = new Set(["SCHEDULED", "WAITING", "CALLED", "IN_PROGRESS"]);
const PAST_STATUSES = new Set(["COMPLETED", "CANCELLED", "NO_SHOW"]);

export function getUpcomingAppointments(): DemoAppointment[] {
  return DEMO_APPOINTMENTS.filter((a) => UPCOMING_STATUSES.has(a.status)).sort(
    (a, b) => a.date.localeCompare(b.date)
  );
}

export function getPastAppointments(): DemoAppointment[] {
  return DEMO_APPOINTMENTS.filter((a) => PAST_STATUSES.has(a.status)).sort((a, b) =>
    b.date.localeCompare(a.date)
  );
}

/** The single most relevant appointment to show on the dashboard. */
export function getPrimaryAppointment(): DemoAppointment | null {
  const upcoming = getUpcomingAppointments();
  const active = upcoming.find((a) => a.status === "WAITING" || a.status === "CALLED" || a.status === "IN_PROGRESS");
  return active ?? upcoming[0] ?? null;
}

export function getAppointmentById(id: string): DemoAppointment | null {
  return DEMO_APPOINTMENTS.find((a) => a.id === id) ?? null;
}

export const DEMO_NOTIFICATIONS: DemoNotification[] = [
  {
    id: "n1",
    title: "You're next soon",
    message: "Token A104 — you are #3 in the queue at Nashik Krishi Mandi Procurement Center.",
    type: "STATUS_UPDATE",
    createdAtLabel: "Today, 9:40 AM",
    read: false,
  },
  {
    id: "n2",
    title: "Appointment confirmed",
    message: "Your appointment for Soybean on 9 Sep 2026, 9:00 AM at Pune Rural Procurement Center is confirmed.",
    type: "APPOINTMENT_CONFIRMED",
    createdAtLabel: "1 Sep 2026, 11:20 AM",
    read: true,
  },
  {
    id: "n3",
    title: "Procurement completed",
    message: "Your Onion procurement (Token C088) was completed. Payment status: Paid.",
    type: "PROCUREMENT_COMPLETED",
    createdAtLabel: "23 Aug 2026, 11:40 AM",
    read: true,
  },
  {
    id: "n4",
    title: "Center announcement",
    message: "Nashik Krishi Mandi Procurement Center will remain closed on public holidays.",
    type: "CENTER_ANNOUNCEMENT",
    createdAtLabel: "18 Aug 2026, 4:00 PM",
    read: true,
  },
];
