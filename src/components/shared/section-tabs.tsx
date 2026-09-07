"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

export interface SectionTab {
  href: string;
  label: string;
  /** Unread/pending count shown as a small badge next to the label, when > 0. */
  count?: number;
  countLabel?: string;
}

/** Shared mobile-first sub-navigation, used for both farmer and officer sections. */
export function SectionTabs({ tabs, ariaLabel }: { tabs: SectionTab[]; ariaLabel: string }) {
  const pathname = usePathname();

  return (
    <nav className="mb-6 flex gap-1 overflow-x-auto rounded-lg bg-muted p-1" aria-label={ariaLabel}>
      {tabs.map((tab) => {
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
            {tab.count ? (
              <span
                aria-label={tab.countLabel}
                className="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground"
              >
                {tab.count > 9 ? "9+" : tab.count}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
