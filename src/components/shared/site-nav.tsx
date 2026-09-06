"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";
import { useTranslations } from "@/hooks/use-translations";
import { useAuth } from "@/lib/auth/auth-context";
import type { UserRole } from "@/types/firestore";
import type { Translations } from "@/i18n/en";

function roleDashboardLink(t: Translations): Record<UserRole, { href: string; label: string }> {
  return {
    farmer: { href: ROUTES.farmer.dashboard, label: t.nav.farmerDashboard },
    officer: { href: ROUTES.officer.dashboard, label: t.nav.officerDashboard },
    admin: { href: ROUTES.admin.dashboard, label: t.nav.adminDashboard },
  };
}

export function SiteNav() {
  const t = useTranslations();
  const { user, profile, signOutUser } = useAuth();
  const router = useRouter();

  const links = [
    ...(profile ? [roleDashboardLink(t)[profile.role]] : []),
    { href: ROUTES.about, label: t.nav.about },
  ];

  return (
    <header className="border-b bg-background">
      <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href={ROUTES.home} className="flex items-center gap-2 text-sm font-semibold">
          <Logo size={28} />
          {t.app.name}
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
                {t.nav.signOut}
              </Button>
            </div>
          ) : (
            <Link
              href={ROUTES.login}
              className="rounded-md bg-primary px-3 py-1.5 text-primary-foreground hover:opacity-90"
            >
              {t.nav.login}
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}
