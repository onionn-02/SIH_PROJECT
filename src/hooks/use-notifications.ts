"use client";

import { useEffect, useState } from "react";

import { useAuth } from "@/lib/auth/auth-context";
import { subscribeNotificationsForUser } from "@/services/notifications";
import type { DemoNotification } from "@/lib/demo/types";

interface UseNotificationsResult {
  notifications: DemoNotification[];
  loading: boolean;
  error: string | null;
}

interface LoadedState {
  uid: string;
  notifications: DemoNotification[];
  error: string | null;
}

export function useNotifications(): UseNotificationsResult {
  const { user } = useAuth();
  const [state, setState] = useState<LoadedState | null>(null);

  useEffect(() => {
    if (!user) return;
    const uid = user.uid;
    const unsubscribe = subscribeNotificationsForUser(
      uid,
      (data) => setState({ uid, notifications: data, error: null }),
      (err) =>
        setState({
          uid,
          notifications: [],
          error: err.message || "Could not load notifications right now.",
        })
    );
    return unsubscribe;
  }, [user]);

  if (!user) return { notifications: [], loading: false, error: null };
  if (!state || state.uid !== user.uid) return { notifications: [], loading: true, error: null };
  return { notifications: state.notifications, loading: false, error: state.error };
}
