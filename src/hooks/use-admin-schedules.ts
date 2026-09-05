"use client";

import { useEffect, useState } from "react";

import { subscribeSchedules } from "@/services/schedules";
import type { AdminSchedule } from "@/lib/demo/types";

interface UseAdminSchedulesResult {
  schedules: AdminSchedule[];
  loading: boolean;
  error: string | null;
}

export function useAdminSchedules(): UseAdminSchedulesResult {
  const [schedules, setSchedules] = useState<AdminSchedule[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return subscribeSchedules(setSchedules, (err) => {
      setError(err.message || "Could not load schedules right now.");
      setSchedules([]);
    });
  }, []);

  return { schedules: schedules ?? [], loading: schedules === null, error };
}
