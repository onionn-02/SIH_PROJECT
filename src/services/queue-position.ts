import type { AppointmentStatus } from "@/types/firestore";

export interface MyQueuePosition {
  queuePosition: number | null;
  status: AppointmentStatus;
}

/** Calls the server-side /api/queue-position route (see its docstring for why this can't be a direct Firestore query). */
export async function getMyQueuePosition(
  idToken: string,
  appointmentId: string
): Promise<MyQueuePosition | null> {
  const res = await fetch("/api/queue-position", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${idToken}` },
    body: JSON.stringify({ appointmentId }),
  });
  if (!res.ok) return null;
  return res.json();
}
