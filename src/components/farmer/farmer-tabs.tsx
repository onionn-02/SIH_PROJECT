"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { ROUTES } from "@/config/routes";
import { en } from "@/i18n/en";
import { cn } from "@/lib/utils";

const TABS = [
  { href: ROUTES.farmer.dashboard, label: en.nav.farmerDashboard },
  { href: ROUTES.farmer.schedule, label: en.nav.schedule },
  { href: ROUTES.farmer.history, label: en.nav.history },
];

/** Mobile-first sub-navigation between the farmer's own screens. */
export function FarmerTabs() {
  const pathname = usePathname();

  return (
    <nav
      className="mb-6 flex gap-1 overflow-x-auto rounded-lg bg-muted p-1"
      aria-label="Farmer sections"
    >
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex-1 rounded-md px-3 py-2 text-center text-sm font-medium whitespace-nowrap transition-colors",
              active
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
