"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/lib/auth/auth-context";
import { subscribeFarmerAppointments } from "@/services/appointments";
import type { DemoAppointment } from "@/lib/demo/types";

interface UseFarmerAppointmentsResult {
  appointments: DemoAppointment[];
  loading: boolean;
  error: string | null;
}

interface LoadedState {
  uid: string;
  appointments: DemoAppointment[];
  error: string | null;
}

/** Live list of the signed-in farmer's own appointments (CLAUDE.md §12 — farmers see only their own data). */
export function useFarmerAppointments(): UseFarmerAppointmentsResult {
  const { user } = useAuth();
  const [state, setState] = useState<LoadedState | null>(null);

  useEffect(() => {
    if (!user) return;
    const uid = user.uid;
    const unsubscribe = subscribeFarmerAppointments(
      uid,
      (data) => setState({ uid, appointments: data, error: null }),
      (err) =>
        setState({
          uid,
          appointments: [],
          error: err.message || "Could not load your appointments right now.",
        })
    );
    return unsubscribe;
  }, [user]);

  if (!user) return { appointments: [], loading: false, error: null };
  if (!state || state.uid !== user.uid) return { appointments: [], loading: true, error: null };
  return { appointments: state.appointments, loading: false, error: state.error };
}
