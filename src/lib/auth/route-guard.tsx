"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/config/routes";
import { useAuth } from "@/lib/auth/auth-context";
import type { UserRole } from "@/types/firestore";

/**
 * Client-side redirect guard for role-scoped route segments. This is a UX
 * convenience only — the real authorization boundary is Firestore Security
 * Rules (CLAUDE.md §12), which reject any read/write a signed-in user's
 * role doesn't permit regardless of what the UI shows.
 */
export function RouteGuard({
  role,
  children,
}: {
  role: UserRole;
  children: React.ReactNode;
}) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user || !profile) {
      router.replace(ROUTES.home);
      return;
    }
    if (profile.role !== role) {
      router.replace(ROUTES.home);
    }
  }, [loading, user, profile, role, router]);

  if (loading || !user || !profile || profile.role !== role) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  return <>{children}</>;
}
