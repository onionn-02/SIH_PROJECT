import type { AppointmentStatus } from "@/types/firestore";

/**
 * Attaches a 1-based queue position to every WAITING appointment, in the
 * order given. Never stored in Firestore — always derived so it can't drift
 * out of sync with the real queue (CLAUDE.md §18).
 */
export function withQueuePositions<T extends { status: AppointmentStatus }>(
  appointments: T[]
): (T & { queuePosition: number | null })[] {
  let nextPosition = 1;
  return appointments.map((appointment) => {
    if (appointment.status !== "WAITING") {
      return { ...appointment, queuePosition: null };
    }
    return { ...appointment, queuePosition: nextPosition++ };
  });
}
