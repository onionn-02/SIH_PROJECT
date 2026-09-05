"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";
import { en } from "@/i18n/en";
import { useAuth } from "@/lib/auth/auth-context";
import type { UserRole } from "@/types/firestore";

const roleDashboardLink: Record<UserRole, { href: string; label: string }> = {
  farmer: { href: ROUTES.farmer.dashboard, label: en.nav.farmerDashboard },
  officer: { href: ROUTES.officer.dashboard, label: en.nav.officerDashboard },
  admin: { href: ROUTES.admin.dashboard, label: en.nav.adminDashboard },
};

export function SiteNav() {
  const { user, profile, signOutUser } = useAuth();
  const router = useRouter();

  const links = [
    ...(profile ? [roleDashboardLink[profile.role]] : []),
    { href: ROUTES.about, label: en.nav.about },
  ];

  return (
    <header className="border-b bg-background">
      <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href={ROUTES.home} className="text-sm font-semibold">
          {en.app.name}
        </Link>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-foreground">
              {link.label}
            </Link>
          ))}
          {user && profile ? (
            <div className="flex items-center gap-2">
              <span className="hidden text-xs sm:inline">{profile.full_name}</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={async () => {
                  await signOutUser();
                  router.push(ROUTES.home);
                }}
              >
                <LogOut className="size-4" aria-hidden="true" />
                Sign out
              </Button>
            </div>
          ) : (
            <Link
              href={ROUTES.login}
              className="rounded-md bg-primary px-3 py-1.5 text-primary-foreground hover:opacity-90"
            >
              {en.nav.login}
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
