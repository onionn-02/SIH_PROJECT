import { collection, getDocs, limit, query, where } from "firebase/firestore";

import { db } from "@/lib/firebase/client";
import type { ProcurementRecord } from "@/types/firestore";

/**
 * Quantity is only ever known once a procurement_records entry exists
 * (CLAUDE.md §10). Filters on `farmer_id` in addition to `appointment_id`
 * so the query's equality filters match what the security rule checks —
 * otherwise Firestore denies the whole query with "Missing or insufficient
 * permissions", even though the one matching document would pass the rule.
 */
export async function getRecordedQuantity(appointmentId: string, farmerId: string): Promise<number | null> {
  const snapshot = await getDocs(
    query(
      collection(db, "procurement_records"),
      where("appointment_id", "==", appointmentId),
      where("farmer_id", "==", farmerId),
      limit(1)
    )
  );
  if (snapshot.empty) return null;
  const record = snapshot.docs[0].data() as ProcurementRecord;
  return record.quantity;
}
