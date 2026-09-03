import type { AppointmentStatus } from "@/types/firestore";

/**
 * Allowed appointment status transitions (CLAUDE.md §5, §9).
 * Server-side logic must reject any transition not listed here.
 */
export const ALLOWED_STATUS_TRANSITIONS: Record<AppointmentStatus, AppointmentStatus[]> = {
  SCHEDULED: ["WAITING", "CANCELLED"],
  WAITING: ["CALLED", "NO_SHOW", "CANCELLED"],
  CALLED: ["IN_PROGRESS", "NO_SHOW", "CANCELLED"],
  IN_PROGRESS: ["COMPLETED", "CANCELLED"],
  COMPLETED: [],
  CANCELLED: [],
  NO_SHOW: [],
};

export function isValidStatusTransition(
  from: AppointmentStatus,
  to: AppointmentStatus
): boolean {
  return ALLOWED_STATUS_TRANSITIONS[from].includes(to);
}
