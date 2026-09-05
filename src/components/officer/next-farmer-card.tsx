"use client";

import { PhoneCall, Users } from "lucide-react";

import { StatusBadge } from "@/components/farmer/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { en } from "@/i18n/en";
import { useOfficerQueue } from "@/lib/officer/queue-context";

export function NextFarmerCard() {
  const { nextWaitingByCenter, callNext, loading, actionError, dismissActionError, isPending } =
    useOfficerQueue();
  const showCenterLabel = nextWaitingByCenter.length > 1;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{en.queue.nextFarmer}</CardTitle>
      </CardHeader>
      <CardContent>
        {actionError ? (
          <div
            role="alert"
            className="mb-3 flex items-start justify-between gap-3 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
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
        {loading ? (
          <Skeleton className="h-12 w-full" />
        ) : nextWaitingByCenter.length === 0 ? (
          <EmptyState icon={Users} title={en.queue.noFarmersWaiting} />
        ) : (
          <ul className="space-y-3">
            {nextWaitingByCenter.map((entry) => (
              <li key={entry.id} className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{entry.farmerName}</p>
                  <p className="text-sm text-muted-foreground">
                    {en.farmer.token} {entry.tokenNumber} · {entry.timeSlot} · {entry.commodity}
                    {showCenterLabel ? ` · ${entry.centerName}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusBadge status={entry.status} />
                  <Button disabled={isPending(entry.id)} onClick={() => callNext(entry.id)}>
                    <PhoneCall className="size-4" aria-hidden="true" />
                    {en.officer.callNext}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
