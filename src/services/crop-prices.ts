"use client";

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit as fsLimit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  where,
  writeBatch,
} from "firebase/firestore";

import { db } from "@/lib/firebase/client";
import { formatDateLabel, formatTimestampLabel } from "@/lib/format/datetime";
import type { MarketPrice, PriceComparison, PriceComparisonPoint, PriceHistoryItem } from "@/lib/demo/types";
import type { CropCategory, CropPrice, PriceHistoryEntry, PriceSnapshot, PriceUnit } from "@/types/firestore";

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

/** Deterministic id so re-saving the same effective_date overwrites that day's snapshot instead of duplicating it. */
function snapshotDocId(cropPriceId: string, date: string): string {
  return `${cropPriceId}_${date}`;
}

function snapshotData(cropPriceId: string, input: CropPriceInput, actor: CropPriceActor, now: unknown) {
  return {
    crop_price_id: cropPriceId,
    crop_name: input.cropName,
    category: input.category,
    unit: input.unit,
    price: input.price,
    center_id: input.centerId,
    center_name: input.centerName,
    date: input.effectiveDate,
    recorded_by: actor.uid,
    recorded_by_name: actor.name,
    recorded_by_role: actor.role,
    created_at: now,
  };
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

  batch.set(
    doc(db, "price_snapshots", snapshotDocId(priceRef.id, input.effectiveDate)),
    snapshotData(priceRef.id, input, actor, now)
  );

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

    tx.set(
      doc(db, "price_snapshots", snapshotDocId(cropPriceId, input.effectiveDate)),
      snapshotData(cropPriceId, input, actor, now)
    );
  });
}

/** Admin-only — Firestore rules reject this from an officer regardless of the UI. */
export async function deleteCropPrice(cropPriceId: string): Promise<void> {
  await deleteDoc(doc(db, "crop_prices", cropPriceId));
}

/** The most recently recorded price for this crop at or before `date`, or null if none exists yet. */
async function getSnapshotAsOf(cropPriceId: string, date: string): Promise<PriceSnapshot | null> {
  const snap = await getDocs(
    query(
      collection(db, "price_snapshots"),
      where("crop_price_id", "==", cropPriceId),
      where("date", "<=", date),
      orderBy("date", "desc"),
      fsLimit(1)
    )
  );
  return snap.empty ? null : (snap.docs[0].data() as PriceSnapshot);
}

function toComparisonPoint(requestedDate: string, snapshot: PriceSnapshot | null): PriceComparisonPoint {
  if (!snapshot) return { requestedDate, date: null, dateLabel: null, price: null };
  return { requestedDate, date: snapshot.date, dateLabel: formatDateLabel(snapshot.date), price: snapshot.price };
}

/**
 * Resolves a from/to price comparison for every given crop, in parallel.
 * Used by both the farmer "Compare" view (fromDate varies, toDate is today)
 * and the officer/admin comparison table (either date can be picked).
 */
export async function getPriceComparisons(
  prices: MarketPrice[],
  fromDate: string,
  toDate: string
): Promise<PriceComparison[]> {
  return Promise.all(
    prices.map(async (price): Promise<PriceComparison> => {
      const [fromSnapshot, toSnapshot] = await Promise.all([
        getSnapshotAsOf(price.id, fromDate),
        getSnapshotAsOf(price.id, toDate),
      ]);
      const from = toComparisonPoint(fromDate, fromSnapshot);
      const to = toComparisonPoint(toDate, toSnapshot);
      const canCompare = from.price != null && to.price != null;
      const diff = canCompare ? to.price! - from.price! : null;
      const pct = canCompare && from.price! !== 0 ? (diff! / from.price!) * 100 : null;
      const trend: PriceComparison["trend"] = diff == null ? null : diff > 0 ? "up" : diff < 0 ? "down" : "same";

      return {
        cropPriceId: price.id,
        cropName: price.cropName,
        category: price.category,
        unit: price.unit,
        centerName: price.centerName,
        from,
        to,
        diff,
        pct,
        trend,
      };
    })
  );
}
