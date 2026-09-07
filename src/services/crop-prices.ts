"use client";

import {
  collection,
  deleteDoc,
  doc,
  limit as fsLimit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  writeBatch,
} from "firebase/firestore";

import { db } from "@/lib/firebase/client";
import { formatDateLabel, formatTimestampLabel } from "@/lib/format/datetime";
import type { MarketPrice, PriceHistoryItem } from "@/lib/demo/types";
import type { CropCategory, CropPrice, PriceHistoryEntry, PriceUnit } from "@/types/firestore";

function toMarketPrice(id: string, data: CropPrice): MarketPrice {
  return {
    id,
    cropName: data.crop_name,
    category: data.category,
    unit: data.unit,
    price: data.price,
    previousPrice: data.previous_price,
    centerId: data.center_id,
    centerName: data.center_name,
    effectiveDate: data.effective_date,
    effectiveDateLabel: formatDateLabel(data.effective_date),
    updatedAtLabel: formatTimestampLabel(data.updated_at) ?? "—",
    updatedByName: data.updated_by_name,
    updatedByRole: data.updated_by_role,
  };
}

function toPriceHistoryItem(id: string, data: PriceHistoryEntry): PriceHistoryItem {
  return {
    id,
    cropName: data.crop_name,
    unit: data.unit,
    previousPrice: data.previous_price,
    newPrice: data.new_price,
    centerName: data.center_name,
    changedByName: data.changed_by_name,
    changedByRole: data.changed_by_role,
    changedAtLabel: formatTimestampLabel(data.created_at) ?? "—",
  };
}

/** Live list of every crop price (farmers and officer/admin management both read this same collection). */
export function subscribeCropPrices(
  onData: (prices: MarketPrice[]) => void,
  onError: (error: Error) => void
): () => void {
  return onSnapshot(
    collection(db, "crop_prices"),
    (snapshot) => {
      const prices = snapshot.docs
        .map((d) => toMarketPrice(d.id, d.data() as CropPrice))
        .sort((a, b) => a.cropName.localeCompare(b.cropName));
      onData(prices);
    },
    (err) => onError(err)
  );
}

/** Live feed of the most recent price changes, newest first, for the management pages' audit view. */
export function subscribePriceHistory(
  onData: (entries: PriceHistoryItem[]) => void,
  onError: (error: Error) => void,
  max = 30
): () => void {
  return onSnapshot(
    query(collection(db, "price_history"), orderBy("created_at", "desc"), fsLimit(max)),
    (snapshot) => {
      onData(snapshot.docs.map((d) => toPriceHistoryItem(d.id, d.data() as PriceHistoryEntry)));
    },
    (err) => onError(err)
  );
}

export interface CropPriceActor {
  uid: string;
  name: string;
  role: "officer" | "admin";
}

export interface CropPriceInput {
  cropName: string;
  category: CropCategory;
  unit: PriceUnit;
  price: number;
  centerId: string | null;
  centerName: string | null;
  effectiveDate: string; // "YYYY-MM-DD"
}

/** Adds a new crop price and its opening price_history entry (previous_price null) atomically. */
export async function createCropPrice(input: CropPriceInput, actor: CropPriceActor): Promise<void> {
  const now = serverTimestamp();
  const batch = writeBatch(db);
  const priceRef = doc(collection(db, "crop_prices"));

  batch.set(priceRef, {
    crop_name: input.cropName,
    category: input.category,
    unit: input.unit,
    price: input.price,
    previous_price: null,
    center_id: input.centerId,
    center_name: input.centerName,
    effective_date: input.effectiveDate,
    updated_by: actor.uid,
    updated_by_name: actor.name,
    updated_by_role: actor.role,
    created_at: now,
    updated_at: now,
  });

  batch.set(doc(collection(db, "price_history")), {
    crop_price_id: priceRef.id,
    crop_name: input.cropName,
    unit: input.unit,
    previous_price: null,
    new_price: input.price,
    center_id: input.centerId,
    center_name: input.centerName,
    changed_by: actor.uid,
    changed_by_name: actor.name,
    changed_by_role: actor.role,
    created_at: now,
  });

  await batch.commit();
}

/**
 * Updates a crop price. A price_history entry is written only when the rate
 * itself actually changes — editing just the category/region/effective date
 * doesn't spam the audit trail. `previous_price` on the doc is preserved
 * across a metadata-only edit so the farmer-facing trend indicator doesn't
 * reset to "no change" for an update that didn't touch the price.
 */
export async function updateCropPrice(
  cropPriceId: string,
  input: CropPriceInput,
  actor: CropPriceActor
): Promise<void> {
  const priceRef = doc(db, "crop_prices", cropPriceId);

  await runTransaction(db, async (tx) => {
    const snap = await tx.get(priceRef);
    if (!snap.exists()) throw new Error("This crop price no longer exists.");
    const existing = snap.data() as CropPrice;
    const now = serverTimestamp();
    const priceChanged = existing.price !== input.price;

    tx.update(priceRef, {
      crop_name: input.cropName,
      category: input.category,
      unit: input.unit,
      price: input.price,
      previous_price: priceChanged ? existing.price : existing.previous_price,
      center_id: input.centerId,
      center_name: input.centerName,
      effective_date: input.effectiveDate,
      updated_by: actor.uid,
      updated_by_name: actor.name,
      updated_by_role: actor.role,
      updated_at: now,
    });

    if (priceChanged) {
      tx.set(doc(collection(db, "price_history")), {
        crop_price_id: cropPriceId,
        crop_name: input.cropName,
        unit: input.unit,
        previous_price: existing.price,
        new_price: input.price,
        center_id: input.centerId,
        center_name: input.centerName,
        changed_by: actor.uid,
        changed_by_name: actor.name,
        changed_by_role: actor.role,
        created_at: now,
      });
    }
  });
}

/** Admin-only — Firestore rules reject this from an officer regardless of the UI. */
export async function deleteCropPrice(cropPriceId: string): Promise<void> {
  await deleteDoc(doc(db, "crop_prices", cropPriceId));
}
