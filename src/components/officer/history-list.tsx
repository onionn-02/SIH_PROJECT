"use client";

import { AlertTriangle, History, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { StatusBadge } from "@/components/farmer/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { en } from "@/i18n/en";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth/auth-context";
import { useCenterHistory } from "@/hooks/use-center-history";
import type { AppointmentStatus } from "@/types/firestore";

type FilterKey = "all" | "completed" | "cancelled" | "no_show";

const FILTERS: { key: FilterKey; label: string; statuses: AppointmentStatus[] | null }[] = [
  { key: "all", label: "All", statuses: null },
  { key: "completed", label: en.officer.completed, statuses: ["COMPLETED"] },
  { key: "cancelled", label: en.status.CANCELLED, statuses: ["CANCELLED"] },
  { key: "no_show", label: en.officer.noShow, statuses: ["NO_SHOW"] },
];

/** Read-only log of past procurement outcomes at the officer's center(s) (CLAUDE.md §24 `/officer/history`). */
export function HistoryList() {
  const { profile } = useAuth();
  const centerIds = profile?.assigned_center_ids ?? [];
  const { entries, loading, error } = useCenterHistory(centerIds);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");

  const centers = useMemo(() => {
    const byId = new Map<string, string>();
    for (const e of entries) byId.set(e.centerId, e.centerName);
    return Array.from(byId, ([id, name]) => ({ id, name }));
  }, [entries]);
  const showCenterColumn = centers.length > 1;

  const filtered = useMemo(() => {
    const activeFilter = FILTERS.find((f) => f.key === filter) ?? FILTERS[0];
    const term = search.trim().toLowerCase();
    return entries.filter((entry) => {
      const matchesFilter = !activeFilter.statuses || activeFilter.statuses.includes(entry.status);
      const matchesSearch =
        term.length === 0 ||
        entry.farmerName.toLowerCase().includes(term) ||
        entry.tokenNumber.toLowerCase().includes(term);
      return matchesFilter && matchesSearch;
    });
  }, [entries, search, filter]);

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-9 w-full sm:max-w-xs" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
        <Skeleton className="h-16 w-full" />
      </div>
    );
  }

  if (error) {
    return <EmptyState icon={AlertTriangle} title="Couldn't load history" description={error} />;
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <Search
            className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={en.queue.searchPlaceholder}
            aria-label={en.queue.searchPlaceholder}
            className="pl-8"
          />
        </div>
        <div className="flex flex-wrap gap-1 rounded-lg bg-muted p-1">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFilter(f.key)}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium whitespace-nowrap transition-colors",
                filter === f.key
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={History} title={en.officer.noHistory} />
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-lg border md:block">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-2 font-medium">{en.farmer.token}</th>
                  <th className="px-4 py-2 font-medium">{en.queue.farmer}</th>
                  {showCenterColumn ? (
                    <th className="px-4 py-2 font-medium">{en.queue.center}</th>
                  ) : null}
                  <th className="px-4 py-2 font-medium">{en.officer.scheduledFor}</th>
                  <th className="px-4 py-2 font-medium">{en.officer.recordedAt}</th>
                  <th className="px-4 py-2 font-medium">{en.farmer.status}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-4 py-3 font-medium">{entry.tokenNumber}</td>
                    <td className="px-4 py-3">
                      <div>{entry.farmerName}</div>
                      <div className="text-xs text-muted-foreground">{entry.commodity}</div>
                    </td>
                    {showCenterColumn ? (
                      <td className="px-4 py-3 text-muted-foreground">{entry.centerName}</td>
                    ) : null}
                    <td className="px-4 py-3 text-muted-foreground">{entry.scheduledDateLabel}</td>
                    <td className="px-4 py-3 text-muted-foreground">{entry.recordedAtLabel}</td>
                    <td className="px-4 py-3">
                      <StatusBadge status={entry.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {filtered.map((entry) => (
              <div key={entry.id} className="rounded-lg border p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">
                      {entry.tokenNumber} · {entry.farmerName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {showCenterColumn ? `${entry.centerName} · ` : ""}
                      {entry.recordedAtLabel} · {entry.commodity}
                    </p>
                  </div>
                  <StatusBadge status={entry.status} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
