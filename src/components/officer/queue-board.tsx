"use client";

import { AlertTriangle, Search } from "lucide-react";
import { useMemo, useState } from "react";

import { StatusBadge } from "@/components/farmer/status-badge";
import { QueueActions } from "@/components/officer/queue-actions";
import { EmptyState } from "@/components/shared/empty-state";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { en } from "@/i18n/en";
import { cn } from "@/lib/utils";
import { useOfficerQueue } from "@/lib/officer/queue-context";
import type { AppointmentStatus } from "@/types/firestore";

type FilterKey = "all" | "waiting" | "active" | "completed";

const FILTERS: { key: FilterKey; label: string; statuses: AppointmentStatus[] | null }[] = [
  { key: "all", label: "All", statuses: null },
  { key: "waiting", label: en.officer.waiting, statuses: ["WAITING"] },
  { key: "active", label: en.officer.inProgress, statuses: ["CALLED", "IN_PROGRESS"] },
  { key: "completed", label: en.officer.completed, statuses: ["COMPLETED"] },
];

export function QueueBoard() {
  const { queue, loading, error, actionError, dismissActionError } = useOfficerQueue();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");

  const filtered = useMemo(() => {
    const activeFilter = FILTERS.find((f) => f.key === filter) ?? FILTERS[0];
    const term = search.trim().toLowerCase();
    return queue.filter((appointment) => {
      const matchesFilter =
        !activeFilter.statuses || activeFilter.statuses.includes(appointment.status);
      const matchesSearch =
        term.length === 0 ||
        appointment.farmerName.toLowerCase().includes(term) ||
        appointment.tokenNumber.toLowerCase().includes(term);
      return matchesFilter && matchesSearch;
    });
  }, [queue, search, filter]);

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
    return (
      <EmptyState
        icon={AlertTriangle}
        title="Couldn't load the queue"
        description={error}
      />
    );
  }

  return (
    <div className="space-y-4">
      {actionError ? (
        <div
          role="alert"
          className="flex items-start justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
        >
          <span>{actionError}</span>
          <button
            type="button"
            onClick={dismissActionError}
            className="shrink-0 font-medium underline underline-offset-2"
          >
            {en.queue.dismiss}
          </button>
        </div>
      ) : null}
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
        <EmptyState icon={Search} title={en.queue.noResults} />
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-lg border md:block">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 text-left text-xs text-muted-foreground uppercase">
                <tr>
                  <th className="px-4 py-2 font-medium">{en.farmer.token}</th>
                  <th className="px-4 py-2 font-medium">{en.queue.farmer}</th>
                  <th className="px-4 py-2 font-medium">{en.farmer.time}</th>
                  <th className="px-4 py-2 font-medium">{en.queue.position}</th>
                  <th className="px-4 py-2 font-medium">{en.farmer.status}</th>
                  <th className="px-4 py-2 font-medium">{en.queue.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filtered.map((appointment) => (
                  <tr key={appointment.id}>
                    <td className="px-4 py-3 font-medium">{appointment.tokenNumber}</td>
                    <td className="px-4 py-3">
                      <div>{appointment.farmerName}</div>
                      <div className="text-xs text-muted-foreground">{appointment.commodity}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{appointment.timeSlot}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {appointment.queuePosition != null ? `#${appointment.queuePosition}` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={appointment.status} />
                    </td>
                    <td className="px-4 py-3">
                      <QueueActions appointment={appointment} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {filtered.map((appointment) => (
              <div key={appointment.id} className="rounded-lg border p-4">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold">
                      {appointment.tokenNumber} · {appointment.farmerName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {appointment.timeSlot} · {appointment.commodity}
                      {appointment.queuePosition != null ? ` · #${appointment.queuePosition}` : ""}
                    </p>
                  </div>
                  <StatusBadge status={appointment.status} />
                </div>
                <QueueActions appointment={appointment} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
