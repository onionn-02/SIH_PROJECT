"use client";

import { useEffect, useState } from "react";

import { subscribeUsers } from "@/services/users";
import type { AdminUser } from "@/lib/demo/types";

interface UseAdminUsersResult {
  users: AdminUser[];
  loading: boolean;
  error: string | null;
}

export function useAdminUsers(): UseAdminUsersResult {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return subscribeUsers(setUsers, (err) => {
      setError(err.message || "Could not load users right now.");
      setUsers([]);
    });
  }, []);

  return { users: users ?? [], loading: users === null, error };
}
