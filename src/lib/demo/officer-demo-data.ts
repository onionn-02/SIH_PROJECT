/**
 * Fictional demo/seed data for the Day 3 officer queue (CLAUDE.md §21, §33).
 * Represents today's full appointment list at the same center used in the
 * farmer demo data, so the two experiences describe one consistent world.
 * The hero appointment (Token A104 / Ramesh Patil) is derived directly from
 * the farmer demo data so the two never drift out of sync.
 */
import { getAppointmentById } from "@/lib/demo/farmer-demo-data";
import type { AppointmentStatus } from "@/types/firestore";

export interface QueueAppointment {
  id: string;
  tokenNumber: string;
  farmerName: string;
  farmerPhone: string;
  commodity: string;
  timeSlot: string;
  status: AppointmentStatus;
}

const hero = getAppointmentById("a104")!;

const heroQueueEntry: QueueAppointment = {
  id: hero.id,
  tokenNumber: hero.tokenNumber,
  farmerName: hero.farmerName,
  farmerPhone: "+91 90210 33445",
  commodity: hero.commodity,
  timeSlot: hero.timeSlot,
  status: hero.status,
};

/**
 * Today's queue at Nashik Krishi Mandi Procurement Center, in appointment
 * order. Queue positions are never stored here — they are derived from
 * this order so they stay correct as statuses change (CLAUDE.md §18).
 */
export const INITIAL_TODAY_QUEUE: QueueAppointment[] = [
  {
    id: "a088",
    tokenNumber: "A088",
    farmerName: "Alka Bhosale",
    farmerPhone: "+91 90211 22110",
    commodity: "Onion",
    timeSlot: "8:00 AM",
    status: "CANCELLED",
  },
  {
    id: "a090",
    tokenNumber: "A090",
    farmerName: "Dilip Pawar",
    farmerPhone: "+91 90211 33221",
    commodity: "Onion",
    timeSlot: "8:30 AM",
    status: "NO_SHOW",
  },
  {
    id: "a101",
    tokenNumber: "A101",
    farmerName: "Anil Kadam",
    farmerPhone: "+91 90211 44332",
    commodity: "Onion",
    timeSlot: "9:00 AM",
    status: "COMPLETED",
  },
  {
    id: "a102",
    tokenNumber: "A102",
    farmerName: "Suresh Jadhav",
    farmerPhone: "+91 90211 55443",
    commodity: "Onion",
    timeSlot: "9:30 AM",
    status: "COMPLETED",
  },
  {
    id: "a103",
    tokenNumber: "A103",
    farmerName: "Meena Kale",
    farmerPhone: "+91 90211 66554",
    commodity: "Onion",
    timeSlot: "10:00 AM",
    status: "IN_PROGRESS",
  },
  {
    id: "a106",
    tokenNumber: "A106",
    farmerName: "Vitthal Shinde",
    farmerPhone: "+91 90211 77665",
    commodity: "Onion",
    timeSlot: "10:15 AM",
    status: "WAITING",
  },
  {
    id: "a109",
    tokenNumber: "A109",
    farmerName: "Sunita More",
    farmerPhone: "+91 90211 88776",
    commodity: "Onion",
    timeSlot: "10:20 AM",
    status: "WAITING",
  },
  heroQueueEntry,
  {
    id: "a112",
    tokenNumber: "A112",
    farmerName: "Prakash Wagh",
    farmerPhone: "+91 90211 99887",
    commodity: "Onion",
    timeSlot: "10:45 AM",
    status: "WAITING",
  },
  {
    id: "a115",
    tokenNumber: "A115",
    farmerName: "Kavita Deshmukh",
    farmerPhone: "+91 90212 00998",
    commodity: "Onion",
    timeSlot: "11:00 AM",
    status: "SCHEDULED",
  },
];

/**
 * Attaches a 1-based queue position to every WAITING appointment, in the
 * order they appear in the list. Non-waiting appointments get `null`.
 */
export function withQueuePositions(
  appointments: QueueAppointment[]
): (QueueAppointment & { queuePosition: number | null })[] {
  let nextPosition = 1;
  return appointments.map((appointment) => {
    if (appointment.status !== "WAITING") {
      return { ...appointment, queuePosition: null };
    }
    return { ...appointment, queuePosition: nextPosition++ };
  });
}
