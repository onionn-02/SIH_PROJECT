import type { Timestamp } from "firebase/firestore";

const DATE_FMT = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
});
const TIME_FMT = new Intl.DateTimeFormat("en-IN", {
  hour: "numeric",
  minute: "2-digit",
  hour12: true,
});

/** "YYYY-MM-DD" for the caller's local date, used as the appointment date key. */
export function todayDateKey(date: Date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** Adds (or subtracts, with a negative n) whole days to a "YYYY-MM-DD" key. */
export function addDaysToDateKey(dateKey: string, n: number): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  return todayDateKey(new Date(y, m - 1, d + n));
}

/** "Today, 4 Sep 2026" if dateKey is today, else "4 Sep 2026". */
export function formatDateLabel(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const label = DATE_FMT.format(date);
  return dateKey === todayDateKey() ? `Today, ${label}` : label;
}

/** "10:30 AM" for a Date. */
export function formatTimeLabel(date: Date): string {
  return TIME_FMT.format(date);
}

/** "Today, 9:40 AM" if the timestamp is today, else "23 Aug 2026, 11:40 AM". */
export function formatTimestampLabel(timestamp: Timestamp | null | undefined): string | null {
  if (!timestamp) return null;
  const date = timestamp.toDate();
  const dateKey = todayDateKey(date);
  const time = formatTimeLabel(date);
  return dateKey === todayDateKey() ? `Today, ${time}` : `${DATE_FMT.format(date)}, ${time}`;
}
