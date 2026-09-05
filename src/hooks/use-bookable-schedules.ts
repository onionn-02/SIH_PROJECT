"use client";

import { useEffect, useState } from "react";

import { subscribeBookableSchedules } from "@/services/schedules";
import type { BookableSchedule } from "@/lib/demo/types";

interface UseBookableSchedulesResult {
  schedules: BookableSchedule[];
  loading: boolean;
  error: string | null;
}

export function useBookableSchedules(): UseBookableSchedulesResult {
  const [schedules, setSchedules] = useState<BookableSchedule[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return subscribeBookableSchedules(setSchedules, (err) => {
      setError(err.message || "Could not load available schedules right now.");
      setSchedules([]);
    });
  }, []);

  return { schedules: schedules ?? [], loading: schedules === null, error };
}
