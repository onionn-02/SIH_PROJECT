/**
 * Creates (or updates) one Firebase Auth user + matching `profiles/{uid}`
 * document, for whenever you need a real farmer/officer/admin account
 * outside the fixed demo scenario (CLAUDE.md §12 — roles are assigned via
 * the profile document, never trusted from client input). There's no
 * admin UI for this yet (that lands with the Day 5 admin panel), so this
 * is the supported way to create one until then.
 *
 * Usage:
 *   npm run create-user -- --email=someone@example.com --password=Secret123 \
 *     --name="Full Name" --role=admin [--phone="+91 90000 00000"] [--center=center-nashik-01]
 *
 * --center is required only when --role=officer (CLAUDE.md §11 — an
 * officer is scoped to exactly one assigned center).
 */
import path from "node:path";
import dotenv from "dotenv";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, Timestamp } from "firebase-admin/firestore";

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  throw new Error(
    "Missing FIREBASE_ADMIN_PROJECT_ID / FIREBASE_ADMIN_CLIENT_EMAIL / FIREBASE_ADMIN_PRIVATE_KEY in .env.local"
  );
}

function parseArgs(): Record<string, string> {
  const args: Record<string, string> = {};
  for (const raw of process.argv.slice(2)) {
    const match = /^--([^=]+)=(.*)$/.exec(raw);
    if (match) args[match[1]] = match[2];
  }
  return args;
}

const args = parseArgs();
const { email, password, name, role, phone, center } = args;

const VALID_ROLES = ["farmer", "officer", "admin"];

if (!email || !password || !name || !role) {
  console.error(
    "Usage: npm run create-user -- --email=... --password=... --name=\"...\" --role=farmer|officer|admin [--phone=...] [--center=centerId]"
  );
  process.exit(1);
}
if (!VALID_ROLES.includes(role)) {
  console.error(`--role must be one of: ${VALID_ROLES.join(", ")}`);
  process.exit(1);
}
if (role === "officer" && !center) {
  console.error("--center is required when --role=officer (an officer is scoped to one assigned center).");
  process.exit(1);
}

if (getApps().length === 0) {
  initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
}

const auth = getAuth();
const db = getFirestore();

async function main() {
  let uid: string;
  try {
    const existing = await auth.getUserByEmail(email);
    await auth.updateUser(existing.uid, { password, displayName: name });
    uid = existing.uid;
    console.log(`Updated existing auth user: ${email}`);
  } catch {
    const created = await auth.createUser({ email, password, displayName: name, emailVerified: true });
    uid = created.uid;
    console.log(`Created new auth user: ${email}`);
  }

  const now = Timestamp.now();
  await db.doc(`profiles/${uid}`).set({
    full_name: name,
    phone: phone ?? "",
    role,
    preferred_language: "en",
    assigned_center_id: role === "officer" ? center : null,
    created_at: now,
    updated_at: now,
  });

  console.log(`Profile set: role=${role}${role === "officer" ? `, center=${center}` : ""}`);
  console.log(`Login: ${email} / (the password you passed)`);
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Failed:", err);
    process.exit(1);
  });
