import { NextResponse } from "next/server";

import { adminAuth, adminDb } from "@/lib/firebase/admin";
import { withQueuePositions } from "@/lib/queue/positions";
import type { Appointment } from "@/types/firestore";

/**
 * Returns the calling farmer's own queue position for one appointment.
 *
 * A farmer's Firestore security rules only grant `get`/`list` on their own
 * appointment documents (CLAUDE.md §11), so the client can't run the
 * center+date queue query the officer view uses — Firestore rejects a
 * `list` query outright unless every possible matching document is
 * provably readable by the caller, and `farmer_id == request.auth.uid`
 * can't be proven for a query that only filters on center_id/date. This
 * route runs the same query with the Admin SDK (which bypasses security
 * rules) and returns only the one number the farmer is allowed to see,
 * instead of loosening the rules to expose every other farmer's queue
 * entry to the client.
 */
export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization") ?? "";
  const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice("Bearer ".length) : null;
  if (!idToken) {
    return NextResponse.json({ error: "Missing bearer token." }, { status: 401 });
  }

  let uid: string;
  try {
    uid = (await adminAuth.verifyIdToken(idToken)).uid;
  } catch {
    return NextResponse.json({ error: "Invalid or expired token." }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const appointmentId = body?.appointmentId;
  if (typeof appointmentId !== "string" || !appointmentId) {
    return NextResponse.json({ error: "appointmentId is required." }, { status: 400 });
  }

  const appointmentSnap = await adminDb.doc(`appointments/${appointmentId}`).get();
  if (!appointmentSnap.exists) {
    return NextResponse.json({ error: "Appointment not found." }, { status: 404 });
  }

  const appointment = appointmentSnap.data() as Appointment;
  if (appointment.farmer_id !== uid) {
    return NextResponse.json({ error: "Not your appointment." }, { status: 403 });
  }

  const queueSnapshot = await adminDb
    .collection("appointments")
    .where("center_id", "==", appointment.center_id)
    .where("date", "==", appointment.date)
    .get();

  const ordered = queueSnapshot.docs
    .map((d) => ({ id: d.id, data: d.data() as Appointment }))
    .sort((a, b) => a.data.appointment_time.toMillis() - b.data.appointment_time.toMillis())
    .map(({ id, data }) => ({ id, status: data.status }));

  const withPositions = withQueuePositions(ordered);
  const mine = withPositions.find((entry) => entry.id === appointmentId);

  return NextResponse.json({
    queuePosition: mine?.queuePosition ?? null,
    status: appointment.status,
  });
}
