"use client";

import { useEffect, useState } from "react";

import { subscribeCenters } from "@/services/centers";
import type { AdminCenter } from "@/lib/demo/types";

interface UseAdminCentersResult {
  centers: AdminCenter[];
  loading: boolean;
  error: string | null;
}

export function useAdminCenters(): UseAdminCentersResult {
  const [centers, setCenters] = useState<AdminCenter[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return subscribeCenters(setCenters, (err) => {
      setError(err.message || "Could not load centers right now.");
      setCenters([]);
    });
  }, []);

  return { centers: centers ?? [], loading: centers === null, error };
}
