import { doc, serverTimestamp, updateDoc } from "firebase/firestore";

import { db } from "@/lib/firebase/client";
import type { Profile } from "@/types/firestore";

export interface ProfileUpdateInput {
  full_name: string;
  phone: string;
  preferred_language: Profile["preferred_language"];
}

/**
 * A signed-in user editing their own basic details (CLAUDE.md §7 Profile).
 * Only touches name/phone/language — firestore.rules rejects a self-update
 * that changes `role` or `assigned_center_ids` (self-escalation guard).
 */
export async function updateOwnProfile(uid: string, input: ProfileUpdateInput): Promise<void> {
  await updateDoc(doc(db, "profiles", uid), {
    ...input,
    updated_at: serverTimestamp(),
  });
}
