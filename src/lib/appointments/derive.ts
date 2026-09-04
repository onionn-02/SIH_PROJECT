import type { DemoAppointment } from "@/lib/demo/types";

const UPCOMING_STATUSES = new Set(["SCHEDULED", "WAITING", "CALLED", "IN_PROGRESS"]);
const PAST_STATUSES = new Set(["COMPLETED", "CANCELLED", "NO_SHOW"]);

export function getUpcomingAppointments(appointments: DemoAppointment[]): DemoAppointment[] {
  return appointments
    .filter((a) => UPCOMING_STATUSES.has(a.status))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function getPastAppointments(appointments: DemoAppointment[]): DemoAppointment[] {
  return appointments
    .filter((a) => PAST_STATUSES.has(a.status))
    .sort((a, b) => b.date.localeCompare(a.date));
}

/** The single most relevant appointment to show on the dashboard. */
export function getPrimaryAppointment(appointments: DemoAppointment[]): DemoAppointment | null {
  const upcoming = getUpcomingAppointments(appointments);
  const active = upcoming.find(
    (a) => a.status === "WAITING" || a.status === "CALLED" || a.status === "IN_PROGRESS"
  );
  return active ?? upcoming[0] ?? null;
}
