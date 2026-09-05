"use client";

import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase/client";
import type { AdminCenter, DemoCenter } from "@/lib/demo/types";
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

function toAdminCenter(id: string, data: ProcurementCenter): AdminCenter {
  return {
    id,
    name: data.name,
    code: data.code,
    address: data.address,
    district: data.district,
    state: data.state,
    contactPhone: data.contact_phone,
    operatingStart: data.operating_start,
    operatingEnd: data.operating_end,
    active: data.active,
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

export async function getAllCenters(): Promise<AdminCenter[]> {
  const snapshot = await getDocs(collection(db, "procurement_centers"));
  return snapshot.docs.map((d) => toAdminCenter(d.id, d.data() as ProcurementCenter));
}

/** Live list of every center (active and inactive) for the admin panel. */
export function subscribeCenters(
  onData: (centers: AdminCenter[]) => void,
  onError: (error: Error) => void
): () => void {
  return onSnapshot(
    collection(db, "procurement_centers"),
    (snapshot) => {
      const centers = snapshot.docs
        .map((d) => toAdminCenter(d.id, d.data() as ProcurementCenter))
        .sort((a, b) => a.name.localeCompare(b.name));
      onData(centers);
    },
    (err) => onError(err)
  );
}

export interface CenterInput {
  name: string;
  code: string;
  address: string;
  district: string;
  state: string;
  contactPhone: string;
  operatingStart: string;
  operatingEnd: string;
}

export async function createCenter(input: CenterInput): Promise<void> {
  const now = serverTimestamp();
  await addDoc(collection(db, "procurement_centers"), {
    name: input.name,
    code: input.code,
    address: input.address,
    district: input.district,
    state: input.state,
    latitude: null,
    longitude: null,
    contact_phone: input.contactPhone,
    operating_start: input.operatingStart,
    operating_end: input.operatingEnd,
    active: true,
    created_at: now,
    updated_at: now,
  });
}

export async function updateCenter(
  centerId: string,
  updates: Partial<CenterInput> & { active?: boolean }
): Promise<void> {
  const data: Record<string, unknown> = { updated_at: serverTimestamp() };
  if (updates.name !== undefined) data.name = updates.name;
  if (updates.code !== undefined) data.code = updates.code;
  if (updates.address !== undefined) data.address = updates.address;
  if (updates.district !== undefined) data.district = updates.district;
  if (updates.state !== undefined) data.state = updates.state;
  if (updates.contactPhone !== undefined) data.contact_phone = updates.contactPhone;
  if (updates.operatingStart !== undefined) data.operating_start = updates.operatingStart;
  if (updates.operatingEnd !== undefined) data.operating_end = updates.operatingEnd;
  if (updates.active !== undefined) data.active = updates.active;
  await updateDoc(doc(db, "procurement_centers", centerId), data);
}
