import { collection, doc, onSnapshot, serverTimestamp, updateDoc } from "firebase/firestore";

import { db } from "@/lib/firebase/client";
import type { AdminUser } from "@/lib/demo/types";
import type { Profile } from "@/types/firestore";

const ROLE_ORDER: Record<Profile["role"], number> = { admin: 0, officer: 1, farmer: 2 };

function toAdminUser(id: string, data: Profile): AdminUser {
  return {
    id,
    fullName: data.full_name,
    phone: data.phone,
    role: data.role,
    assignedCenterIds: data.assigned_center_ids ?? [],
  };
}

/** Live list of every user profile (CLAUDE.md §9 User Management, Day 7). */
export function subscribeUsers(
  onData: (users: AdminUser[]) => void,
  onError: (error: Error) => void
): () => void {
  return onSnapshot(
    collection(db, "profiles"),
    (snapshot) => {
      const users = snapshot.docs
        .map((d) => toAdminUser(d.id, d.data() as Profile))
        .sort((a, b) => ROLE_ORDER[a.role] - ROLE_ORDER[b.role] || a.fullName.localeCompare(b.fullName));
      onData(users);
    },
    (err) => onError(err)
  );
}

/** Reassigns which centers an officer manages the queue for (admin-only per firestore.rules). */
export async function updateOfficerCenters(uid: string, centerIds: string[]): Promise<void> {
  await updateDoc(doc(db, "profiles", uid), {
    assigned_center_ids: centerIds,
    updated_at: serverTimestamp(),
  });
}
