import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  type QueryDocumentSnapshot,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "@/lib/firebase/client";
import type { DemoNotification } from "@/lib/demo/types";
import type { AppNotification, NotificationType } from "@/types/firestore";

function formatCreatedAtLabel(notification: AppNotification): string {
  if (!notification.created_at) return "Just now";
  const date = notification.created_at.toDate();
  return new Intl.DateTimeFormat("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}

/**
 * `orderBy` is intentionally left off the query (equality-filter-plus-sort
 * on a different field would require a composite index, for no real
 * benefit at this data volume) — results are sorted newest-first here.
 */
function toSortedNotifications(docs: QueryDocumentSnapshot[]): DemoNotification[] {
  return docs
    .map((d) => ({ id: d.id, data: d.data() as AppNotification }))
    .sort((a, b) => (b.data.created_at?.toMillis() ?? 0) - (a.data.created_at?.toMillis() ?? 0))
    .map(({ id, data }) => ({
      id,
      title: data.title,
      message: data.message,
      type: data.type,
      createdAtLabel: formatCreatedAtLabel(data),
      read: data.read_at !== null,
    }));
}

export async function getNotificationsForUser(userId: string): Promise<DemoNotification[]> {
  const snapshot = await getDocs(query(collection(db, "notifications"), where("user_id", "==", userId)));
  return toSortedNotifications(snapshot.docs);
}

export function subscribeNotificationsForUser(
  userId: string,
  onData: (notifications: DemoNotification[]) => void,
  onError: (error: Error) => void
): () => void {
  const q = query(collection(db, "notifications"), where("user_id", "==", userId));
  return onSnapshot(q, (snapshot) => onData(toSortedNotifications(snapshot.docs)), (err) => onError(err));
}

export async function createNotification(
  userId: string,
  title: string,
  message: string,
  type: NotificationType
): Promise<void> {
  await addDoc(collection(db, "notifications"), {
    user_id: userId,
    title,
    message,
    type,
    read_at: null,
    created_at: serverTimestamp(),
    push_sent: false,
  });
}

export async function markNotificationRead(notificationId: string): Promise<void> {
  await updateDoc(doc(db, "notifications", notificationId), { read_at: serverTimestamp() });
}
