"use client";

import { useEffect, useState } from "react";

import { todayDateKey } from "@/lib/format/datetime";
import {
  type AdminAppointmentSummary,
  type DailyCompletedCount,
  getAverageWaitMinutes,
  getDailyCompletedCounts,
  subscribeAppointmentsOnDate,
} from "@/services/admin";
import { getAllCenters } from "@/services/centers";
import type { AppointmentStatus } from "@/types/firestore";

export interface StatusDistributionEntry {
  status: AppointmentStatus;
  count: number;
}

export interface CenterActivityEntry {
  centerId: string;
  centerName: string;
  count: number;
}

interface UseAdminAnalyticsResult {
  dailyCompleted: DailyCompletedCount[];
  statusDistribution: StatusDistributionEntry[];
  centerActivity: CenterActivityEntry[];
  averageWaitMinutes: number | null;
  loading: boolean;
  error: string | null;
}

const ALL_STATUSES: AppointmentStatus[] = [
  "SCHEDULED",
  "WAITING",
  "CALLED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "NO_SHOW",
];

/**
 * Combines today's live appointment feed with two one-off aggregate reads
 * (7-day completed counts, average wait time) into the analytics page's
 * data (CLAUDE.md §9 Analytics, Day 5).
 */
export function useAdminAnalytics(): UseAdminAnalyticsResult {
  const dateKey = todayDateKey();
  const [appointmentsToday, setAppointmentsToday] = useState<AdminAppointmentSummary[] | null>(null);
  const [centerNames, setCenterNames] = useState<Map<string, string> | null>(null);
  const [dailyCompleted, setDailyCompleted] = useState<DailyCompletedCount[] | null>(null);
  const [averageWaitMinutes, setAverageWaitMinutes] = useState<number | null | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return subscribeAppointmentsOnDate(dateKey, setAppointmentsToday, (err) =>
      setError(err.message || "Could not load today's appointments right now.")
    );
  }, [dateKey]);

  useEffect(() => {
    getAllCenters()
      .then((centers) => setCenterNames(new Map(centers.map((c) => [c.id, c.name]))))
      .catch(() => setCenterNames(new Map()));
  }, []);

  useEffect(() => {
    getDailyCompletedCounts(7)
      .then(setDailyCompleted)
      .catch(() => setDailyCompleted([]));
  }, []);

  useEffect(() => {
    if (!appointmentsToday) return;
    const completed = appointmentsToday.filter((a) => a.status === "COMPLETED");
    getAverageWaitMinutes(completed.map((a) => ({ id: a.id, farmerId: a.farmerId })))
      .then(setAverageWaitMinutes)
      .catch(() => setAverageWaitMinutes(null));
  }, [appointmentsToday]);

  const loading =
    appointmentsToday === null || centerNames === null || dailyCompleted === null || averageWaitMinutes === undefined;

  if (loading) {
    return {
      dailyCompleted: [],
      statusDistribution: [],
      centerActivity: [],
      averageWaitMinutes: null,
      loading: true,
      error,
    };
  }

  const statusDistribution: StatusDistributionEntry[] = ALL_STATUSES.map((status) => ({
    status,
    count: appointmentsToday.filter((a) => a.status === status).length,
  })).filter((entry) => entry.count > 0);

  const centerCounts = new Map<string, number>();
  for (const a of appointmentsToday) {
    centerCounts.set(a.centerId, (centerCounts.get(a.centerId) ?? 0) + 1);
  }
  const centerActivity: CenterActivityEntry[] = Array.from(centerCounts.entries()).map(
    ([centerId, count]) => ({ centerId, centerName: centerNames.get(centerId) ?? "Unknown center", count })
  );

  return {
    dailyCompleted,
    statusDistribution,
    centerActivity,
    averageWaitMinutes,
    loading: false,
    error,
  };
}
