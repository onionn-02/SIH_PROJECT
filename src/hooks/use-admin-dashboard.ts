"use client";

import { useEffect, useState } from "react";

import { todayDateKey } from "@/lib/format/datetime";
import {
  type AdminAppointmentSummary,
  subscribeActiveCenterCount,
  subscribeAppointmentsOnDate,
  subscribeFarmerCount,
} from "@/services/admin";

export interface AdminDashboardStats {
  totalFarmers: number;
  activeCenters: number;
  todayAppointments: number;
  completedToday: number;
  waitingNow: number;
  cancelledOrNoShow: number;
}

interface UseAdminDashboardResult {
  stats: AdminDashboardStats | null;
  appointmentsToday: AdminAppointmentSummary[];
  loading: boolean;
  error: string | null;
}

/**
 * Combines the three live admin subscriptions (farmer count, active center
 * count, today's appointments) into one dashboard-ready shape. Each piece
 * loads independently, so the dashboard renders as soon as all three have
 * reported at least once rather than waiting on the slowest one twice.
 */
export function useAdminDashboard(): UseAdminDashboardResult {
  const dateKey = todayDateKey();
  const [farmerCount, setFarmerCount] = useState<number | null>(null);
  const [activeCenters, setActiveCenters] = useState<number | null>(null);
  const [appointments, setAppointments] = useState<AdminAppointmentSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const onError = (err: Error) => setError(err.message || "Could not load admin data right now.");

    const unsubFarmers = subscribeFarmerCount(setFarmerCount, onError);
    const unsubCenters = subscribeActiveCenterCount(setActiveCenters, onError);
    const unsubAppointments = subscribeAppointmentsOnDate(dateKey, setAppointments, onError);

    return () => {
      unsubFarmers();
      unsubCenters();
      unsubAppointments();
    };
  }, [dateKey]);

  const loading = farmerCount === null || activeCenters === null || appointments === null;

  if (loading) {
    return { stats: null, appointmentsToday: [], loading: true, error };
  }

  const stats: AdminDashboardStats = {
    totalFarmers: farmerCount,
    activeCenters,
    todayAppointments: appointments.length,
    completedToday: appointments.filter((a) => a.status === "COMPLETED").length,
    waitingNow: appointments.filter((a) => a.status === "WAITING").length,
    cancelledOrNoShow: appointments.filter((a) => a.status === "CANCELLED" || a.status === "NO_SHOW").length,
  };

  return { stats, appointmentsToday: appointments, loading: false, error };
}
