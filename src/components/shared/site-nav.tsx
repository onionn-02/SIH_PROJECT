"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Moon, Sun } from "lucide-react";

import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";
import { useTheme } from "@/hooks/use-theme";
import { useTranslations } from "@/hooks/use-translations";
import { useAuth } from "@/lib/auth/auth-context";
import { cn } from "@/lib/utils";
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
  const { theme, toggleTheme } = useTheme();
  const { user, profile, signOutUser } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const links = [
    ...(profile ? [roleDashboardLink(t)[profile.role]] : []),
    { href: ROUTES.about, label: t.nav.about },
  ];

  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur-sm supports-backdrop-filter:bg-background/60">
      <nav className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href={ROUTES.home} className="flex items-center gap-2 text-sm font-semibold">
          <Logo size={28} />
          {t.app.name}
        </Link>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          {links.map((link) => {
            const active = pathname === link.href || pathname?.startsWith(`${link.href}/`);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn("hover:text-foreground", active && "font-medium text-foreground")}
              >
                {link.label}
              </Link>
            );
          })}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <Sun className="size-4" aria-hidden="true" />
            ) : (
              <Moon className="size-4" aria-hidden="true" />
            )}
          </Button>
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
              href={pathname === ROUTES.home ? "#choose-role" : `${ROUTES.home}#choose-role`}
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
