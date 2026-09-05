/**
 * Seeds the connected Firebase project with the predictable demo scenario
 * described in CLAUDE.md §21, §33 — one hero farmer (Ramesh Patil, Token
 * A104, Nashik center) plus a believable queue of other farmers, a second
 * center, and matching history/notifications. Safe to re-run as a "reset
 * the demo" command: every fixed-ID document gets fully overwritten, AND
 * (see clearStaleDemoData) any status_history/procurement_records/
 * notifications a *real* app action (an officer call, a completed
 * procurement, a sent announcement) created against these same demo
 * appointments/farmer in between reseeds gets deleted first — otherwise
 * those auto-ID documents would silently survive a reset and show up as
 * stale/contradictory data (e.g. a "Completed" timestamp on an appointment
 * this reseed just put back to WAITING).
 *
 * Usage: npm run seed   (reads FIREBASE_ADMIN_* from .env.local)
 */
import path from "node:path";
import dotenv from "dotenv";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

import { DEMO_ACCOUNTS } from "../src/lib/demo/demo-accounts";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  throw new Error(
    "Missing FIREBASE_ADMIN_PROJECT_ID / FIREBASE_ADMIN_CLIENT_EMAIL / FIREBASE_ADMIN_PRIVATE_KEY in .env.local"
  );
}

if (getApps().length === 0) {
  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

const auth = getAuth();
const db = getFirestore();

// --- small self-contained date helpers (kept out of src/ to avoid this
// script depending on the app's browser-oriented Firebase client module) ---
function dateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function daysFromToday(offset: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d;
}
function at(date: Date, hour: number, minute: number): Date {
  const d = new Date(date);
  d.setHours(hour, minute, 0, 0);
  return d;
}
function timeLabel(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", { hour: "numeric", minute: "2-digit", hour12: true }).format(date);
}
function minutesBefore(date: Date, minutes: number): Date {
  return new Date(date.getTime() - minutes * 60_000);
}

const today = daysFromToday(0);

const NASHIK_ID = "center-nashik-01";
const PUNE_ID = "center-pune-02";

async function ensureUser(email: string, password: string, displayName: string): Promise<string> {
  try {
    const existing = await auth.getUserByEmail(email);
    await auth.updateUser(existing.uid, { password, displayName });
    return existing.uid;
  } catch {
    const created = await auth.createUser({ email, password, displayName, emailVerified: true });
    return created.uid;
  }
}

async function seedCenters() {
  const now = Timestamp.now();
  await db.doc(`procurement_centers/${NASHIK_ID}`).set({
    name: "Nashik Krishi Mandi Procurement Center",
    code: "NSK-01",
    address: "Gate No. 3, APMC Yard, Panchavati",
    district: "Nashik",
    state: "Maharashtra",
    latitude: 20.0059,
    longitude: 73.7912,
    contact_phone: "+91 98230 11223",
    operating_start: "08:00",
    operating_end: "17:00",
    active: true,
    created_at: now,
    updated_at: now,
  });
  await db.doc(`procurement_centers/${PUNE_ID}`).set({
    name: "Pune Rural Procurement Center",
    code: "PUN-02",
    address: "Plot 12, MSAMB Complex, Hadapsar",
    district: "Pune",
    state: "Maharashtra",
    latitude: 18.5089,
    longitude: 73.9260,
    contact_phone: "+91 98220 55667",
    operating_start: "08:00",
    operating_end: "18:00",
    active: true,
    created_at: now,
    updated_at: now,
  });
}

async function seedSchedules() {
  const now = Timestamp.now();
  const schedules: Record<string, Record<string, unknown>> = {
    "sched-nashik-today-onion": {
      center_id: NASHIK_ID,
      date: dateKey(today),
      start_time: "08:00",
      end_time: "13:00",
      commodity: "Onion",
      capacity: 20,
      status: "published",
      notes: null,
    },
    "sched-pune-upcoming-soybean": {
      center_id: PUNE_ID,
      date: dateKey(daysFromToday(5)),
      start_time: "09:00",
      end_time: "14:00",
      commodity: "Soybean",
      capacity: 15,
      status: "published",
      notes: null,
    },
  };
  for (const [id, data] of Object.entries(schedules)) {
    await db.doc(`procurement_schedules/${id}`).set({ ...data, created_at: now, updated_at: now });
  }
}

interface SeedAppointment {
  id: string;
  token: string;
  farmerId: string;
  farmerName: string;
  farmerPhone: string;
  centerId: string;
  scheduleId: string;
  commodity: string;
  when: Date;
  status: string;
  paymentStatus: string | null;
  notes?: string | null;
}

async function seedAppointment(a: SeedAppointment) {
  const now = Timestamp.now();
  await db.doc(`appointments/${a.id}`).set({
    farmer_id: a.farmerId,
    farmer_name: a.farmerName,
    farmer_phone: a.farmerPhone,
    schedule_id: a.scheduleId,
    center_id: a.centerId,
    commodity: a.commodity,
    date: dateKey(a.when),
    token_number: a.token,
    appointment_time: Timestamp.fromDate(a.when),
    time_label: timeLabel(a.when),
    status: a.status,
    queue_position: null,
    notes: a.notes ?? null,
    payment_status: a.paymentStatus,
    created_at: now,
    updated_at: now,
  });
}

async function seedHistory(
  appointmentId: string,
  farmerId: string,
  steps: { status: string; before: Date; changedBy: string }[]
) {
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const prevStatus = i === 0 ? null : steps[i - 1].status;
    await db.doc(`status_history/sh-${appointmentId}-${i}`).set({
      appointment_id: appointmentId,
      farmer_id: farmerId,
      old_status: prevStatus,
      new_status: step.status,
      changed_by: step.changedBy,
      note: null,
      created_at: Timestamp.fromDate(step.before),
    });
  }
}

async function seedRecord(appointmentId: string, farmerId: string, centerId: string, commodity: string, quantity: number, officerId: string, completedAt: Date) {
  await db.doc(`procurement_records/rec-${appointmentId}`).set({
    appointment_id: appointmentId,
    farmer_id: farmerId,
    center_id: centerId,
    commodity,
    quantity,
    completed_at: Timestamp.fromDate(completedAt),
    officer_id: officerId,
    remarks: null,
    created_at: Timestamp.fromDate(completedAt),
  });
}

/**
 * Deletes every status_history/procurement_records document tied to one of
 * the fixed demo appointment IDs, and every notification sent to the demo
 * farmer — regardless of that document's own ID. Must run before this
 * script writes its own fixed-ID data back, so a reseed is a true reset
 * even after the demo has been exercised for real in between (see the
 * module docstring above).
 */
async function clearStaleDemoData(appointmentIds: string[], farmerUid: string) {
  const batch = db.batch();
  let deletions = 0;

  for (const [collection, field] of [
    ["status_history", "appointment_id"],
    ["procurement_records", "appointment_id"],
  ] as const) {
    const snapshot = await db.collection(collection).where(field, "in", appointmentIds).get();
    for (const doc of snapshot.docs) {
      batch.delete(doc.ref);
      deletions++;
    }
  }

  const notifSnapshot = await db.collection("notifications").where("user_id", "==", farmerUid).get();
  for (const doc of notifSnapshot.docs) {
    batch.delete(doc.ref);
    deletions++;
  }

  if (deletions > 0) await batch.commit();
}

async function seedNotification(id: string, userId: string, title: string, message: string, type: string, createdAt: Date, read: boolean) {
  await db.doc(`notifications/${id}`).set({
    user_id: userId,
    title,
    message,
    type,
    read_at: read ? Timestamp.fromDate(createdAt) : null,
    created_at: Timestamp.fromDate(createdAt),
    push_sent: false,
  });
}

async function main() {
  console.log("Seeding demo data into project:", projectId);

  const farmerUid = await ensureUser(DEMO_ACCOUNTS.farmer.email, DEMO_ACCOUNTS.farmer.password, "Ramesh Patil");
  const officerUid = await ensureUser(DEMO_ACCOUNTS.officer.email, DEMO_ACCOUNTS.officer.password, "Suman Kulkarni");
  const adminUid = await ensureUser(DEMO_ACCOUNTS.admin.email, DEMO_ACCOUNTS.admin.password, "Admin User");

  const now = Timestamp.now();
  await db.doc(`profiles/${farmerUid}`).set({
    full_name: "Ramesh Patil",
    phone: "+91 90210 33445",
    role: "farmer",
    preferred_language: "en",
    assigned_center_id: null,
    created_at: now,
    updated_at: now,
  });
  await db.doc(`profiles/${officerUid}`).set({
    full_name: "Suman Kulkarni",
    phone: "+91 90211 00110",
    role: "officer",
    preferred_language: "en",
    assigned_center_id: NASHIK_ID,
    created_at: now,
    updated_at: now,
  });
  await db.doc(`profiles/${adminUid}`).set({
    full_name: "Admin User",
    phone: "+91 90211 00000",
    role: "admin",
    preferred_language: "en",
    assigned_center_id: null,
    created_at: now,
    updated_at: now,
  });

  await seedCenters();
  await seedSchedules();

  // --- Today's queue at Nashik (CLAUDE.md §33 demo scenario) ---
  const queue: SeedAppointment[] = [
    { id: "appt-a088", token: "A088", farmerId: "demo-farmer-a088", farmerName: "Alka Bhosale", farmerPhone: "+91 90211 22110", centerId: NASHIK_ID, scheduleId: "sched-nashik-today-onion", commodity: "Onion", when: at(today, 8, 0), status: "CANCELLED", paymentStatus: null, notes: "Farmer requested cancellation." },
    { id: "appt-a090", token: "A090", farmerId: "demo-farmer-a090", farmerName: "Dilip Pawar", farmerPhone: "+91 90211 33221", centerId: NASHIK_ID, scheduleId: "sched-nashik-today-onion", commodity: "Onion", when: at(today, 8, 30), status: "NO_SHOW", paymentStatus: null },
    { id: "appt-a101", token: "A101", farmerId: "demo-farmer-a101", farmerName: "Anil Kadam", farmerPhone: "+91 90211 44332", centerId: NASHIK_ID, scheduleId: "sched-nashik-today-onion", commodity: "Onion", when: at(today, 9, 0), status: "COMPLETED", paymentStatus: "PAID" },
    { id: "appt-a102", token: "A102", farmerId: "demo-farmer-a102", farmerName: "Suresh Jadhav", farmerPhone: "+91 90211 55443", centerId: NASHIK_ID, scheduleId: "sched-nashik-today-onion", commodity: "Onion", when: at(today, 9, 30), status: "COMPLETED", paymentStatus: "PAID" },
    { id: "appt-a103", token: "A103", farmerId: "demo-farmer-a103", farmerName: "Meena Kale", farmerPhone: "+91 90211 66554", centerId: NASHIK_ID, scheduleId: "sched-nashik-today-onion", commodity: "Onion", when: at(today, 10, 0), status: "IN_PROGRESS", paymentStatus: "PENDING" },
    { id: "appt-a106", token: "A106", farmerId: "demo-farmer-a106", farmerName: "Vitthal Shinde", farmerPhone: "+91 90211 77665", centerId: NASHIK_ID, scheduleId: "sched-nashik-today-onion", commodity: "Onion", when: at(today, 10, 15), status: "WAITING", paymentStatus: null },
    { id: "appt-a109", token: "A109", farmerId: "demo-farmer-a109", farmerName: "Sunita More", farmerPhone: "+91 90211 88776", centerId: NASHIK_ID, scheduleId: "sched-nashik-today-onion", commodity: "Onion", when: at(today, 10, 20), status: "WAITING", paymentStatus: null },
    { id: "appt-a104", token: "A104", farmerId: farmerUid, farmerName: "Ramesh Patil", farmerPhone: "+91 90210 33445", centerId: NASHIK_ID, scheduleId: "sched-nashik-today-onion", commodity: "Onion", when: at(today, 10, 30), status: "WAITING", paymentStatus: "PENDING" },
    { id: "appt-a112", token: "A112", farmerId: "demo-farmer-a112", farmerName: "Prakash Wagh", farmerPhone: "+91 90211 99887", centerId: NASHIK_ID, scheduleId: "sched-nashik-today-onion", commodity: "Onion", when: at(today, 10, 45), status: "WAITING", paymentStatus: null },
    { id: "appt-a115", token: "A115", farmerId: "demo-farmer-a115", farmerName: "Kavita Deshmukh", farmerPhone: "+91 90212 00998", centerId: NASHIK_ID, scheduleId: "sched-nashik-today-onion", commodity: "Onion", when: at(today, 11, 0), status: "SCHEDULED", paymentStatus: null },
  ];

  for (const appointment of queue) {
    await seedAppointment(appointment);
  }

  // --- The hero farmer's own upcoming + past appointments ---
  const puneUpcoming = daysFromToday(5);
  await seedAppointment({
    id: "appt-b210",
    token: "B210",
    farmerId: farmerUid,
    farmerName: "Ramesh Patil",
    farmerPhone: "+91 90210 33445",
    centerId: PUNE_ID,
    scheduleId: "sched-pune-upcoming-soybean",
    commodity: "Soybean",
    when: at(puneUpcoming, 9, 0),
    status: "SCHEDULED",
    paymentStatus: null,
  });

  const c088When = at(daysFromToday(-12), 11, 0);
  await seedAppointment({
    id: "appt-c088",
    token: "C088",
    farmerId: farmerUid,
    farmerName: "Ramesh Patil",
    farmerPhone: "+91 90210 33445",
    centerId: NASHIK_ID,
    scheduleId: "sched-nashik-today-onion",
    commodity: "Onion",
    when: c088When,
    status: "COMPLETED",
    paymentStatus: "PAID",
  });

  const d045When = at(daysFromToday(-21), 14, 0);
  await seedAppointment({
    id: "appt-d045",
    token: "D045",
    farmerId: farmerUid,
    farmerName: "Ramesh Patil",
    farmerPhone: "+91 90210 33445",
    centerId: PUNE_ID,
    scheduleId: "sched-pune-upcoming-soybean",
    commodity: "Soybean",
    when: d045When,
    status: "NO_SHOW",
    paymentStatus: null,
  });

  const e199When = at(daysFromToday(-26), 9, 30);
  await seedAppointment({
    id: "appt-e199",
    token: "E199",
    farmerId: farmerUid,
    farmerName: "Ramesh Patil",
    farmerPhone: "+91 90210 33445",
    centerId: NASHIK_ID,
    scheduleId: "sched-nashik-today-onion",
    commodity: "Onion",
    when: e199When,
    status: "CANCELLED",
    paymentStatus: null,
    notes: "Center closed for maintenance work.",
  });

  const f156When = at(daysFromToday(-38), 10, 0);
  await seedAppointment({
    id: "appt-f156",
    token: "F156",
    farmerId: farmerUid,
    farmerName: "Ramesh Patil",
    farmerPhone: "+91 90210 33445",
    centerId: PUNE_ID,
    scheduleId: "sched-pune-upcoming-soybean",
    commodity: "Wheat",
    when: f156When,
    status: "COMPLETED",
    paymentStatus: "PAID",
  });

  await clearStaleDemoData(
    [...queue.map((a) => a.id), "appt-b210", "appt-c088", "appt-d045", "appt-e199", "appt-f156"],
    farmerUid
  );

  // --- Status history for the hero's appointments ---
  await seedHistory("appt-a104", farmerUid, [
    { status: "SCHEDULED", before: minutesBefore(at(today, 10, 30), 60 * 15), changedBy: "system" },
    { status: "WAITING", before: minutesBefore(at(today, 10, 30), 50), changedBy: officerUid },
  ]);
  await seedHistory("appt-b210", farmerUid, [
    { status: "SCHEDULED", before: daysFromToday(-1), changedBy: "system" },
  ]);
  await seedHistory("appt-c088", farmerUid, [
    { status: "SCHEDULED", before: at(daysFromToday(-15), 17, 0), changedBy: "system" },
    { status: "WAITING", before: at(c088When, 10, 45), changedBy: officerUid },
    { status: "CALLED", before: at(c088When, 11, 2), changedBy: officerUid },
    { status: "IN_PROGRESS", before: at(c088When, 11, 10), changedBy: officerUid },
    { status: "COMPLETED", before: at(c088When, 11, 40), changedBy: officerUid },
  ]);
  await seedHistory("appt-d045", farmerUid, [
    { status: "SCHEDULED", before: at(daysFromToday(-25), 16, 30), changedBy: "system" },
    { status: "WAITING", before: at(d045When, 13, 50), changedBy: officerUid },
  ]);
  await seedHistory("appt-e199", farmerUid, [
    { status: "SCHEDULED", before: at(daysFromToday(-30), 15, 15), changedBy: "system" },
  ]);
  await seedHistory("appt-f156", farmerUid, [
    { status: "SCHEDULED", before: at(daysFromToday(-42), 18, 0), changedBy: "system" },
    { status: "WAITING", before: at(f156When, 9, 40), changedBy: officerUid },
    { status: "CALLED", before: at(f156When, 10, 5), changedBy: officerUid },
    { status: "IN_PROGRESS", before: at(f156When, 10, 12), changedBy: officerUid },
    { status: "COMPLETED", before: at(f156When, 10, 50), changedBy: officerUid },
  ]);

  await seedRecord("appt-c088", farmerUid, NASHIK_ID, "Onion", 480, officerUid, at(c088When, 11, 40));
  await seedRecord("appt-f156", farmerUid, PUNE_ID, "Wheat", 620, officerUid, at(f156When, 10, 50));

  // --- Notifications for the hero farmer ---
  await seedNotification(
    "notif-a104-waiting",
    farmerUid,
    "You're next soon",
    "Token A104 — you are in the queue at Nashik Krishi Mandi Procurement Center.",
    "STATUS_UPDATE",
    at(today, 9, 40),
    false
  );
  await seedNotification(
    "notif-b210-confirmed",
    farmerUid,
    "Appointment confirmed",
    "Your appointment for Soybean at Pune Rural Procurement Center is confirmed.",
    "APPOINTMENT_CONFIRMED",
    daysFromToday(-1),
    true
  );
  await seedNotification(
    "notif-c088-completed",
    farmerUid,
    "Procurement completed",
    "Your Onion procurement (Token C088) was completed. Payment status: Paid.",
    "PROCUREMENT_COMPLETED",
    at(c088When, 11, 40),
    true
  );
  await seedNotification(
    "notif-center-announcement",
    farmerUid,
    "Center announcement",
    "Nashik Krishi Mandi Procurement Center will remain closed on public holidays.",
    "CENTER_ANNOUNCEMENT",
    daysFromToday(-16),
    true
  );

  console.log("Seed complete.");
  console.log("Demo logins:");
  console.log(`  Farmer:  ${DEMO_ACCOUNTS.farmer.email} / ${DEMO_ACCOUNTS.farmer.password}`);
  console.log(`  Officer: ${DEMO_ACCOUNTS.officer.email} / ${DEMO_ACCOUNTS.officer.password}`);
  console.log(`  Admin:   ${DEMO_ACCOUNTS.admin.email} / ${DEMO_ACCOUNTS.admin.password}`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  });
