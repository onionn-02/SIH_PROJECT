"use client";

import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";

import { db } from "@/lib/firebase/client";
import type { DemoCenter } from "@/lib/demo/types";
import type { ProcurementCenter } from "@/types/firestore";

function toDemoCenter(id: string, data: ProcurementCenter): DemoCenter {
  return {
    id,
    name: data.name,
    address: data.address,
    district: data.district,
    state: data.state,
    contactPhone: data.contact_phone,
    operatingHours: `${data.operating_start} – ${data.operating_end}`,
  };
}

export async function getCenter(centerId: string): Promise<DemoCenter | null> {
  const snapshot = await getDoc(doc(db, "procurement_centers", centerId));
  if (!snapshot.exists()) return null;
  return toDemoCenter(snapshot.id, snapshot.data() as ProcurementCenter);
}

export async function getActiveCenters(): Promise<DemoCenter[]> {
  const snapshot = await getDocs(
    query(collection(db, "procurement_centers"), where("active", "==", true))
  );
  return snapshot.docs.map((d) => toDemoCenter(d.id, d.data() as ProcurementCenter));
}
