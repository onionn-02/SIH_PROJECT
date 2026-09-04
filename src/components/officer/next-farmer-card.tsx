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
  const { nextWaiting, callNext, loading } = useOfficerQueue();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{en.queue.nextFarmer}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-12 w-full" />
        ) : nextWaiting ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold">{nextWaiting.farmerName}</p>
              <p className="text-sm text-muted-foreground">
                {en.farmer.token} {nextWaiting.tokenNumber} · {nextWaiting.timeSlot} ·{" "}
                {nextWaiting.commodity}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <StatusBadge status={nextWaiting.status} />
              <Button onClick={() => callNext(nextWaiting.id)}>
                <PhoneCall className="size-4" aria-hidden="true" />
                {en.officer.callNext}
              </Button>
            </div>
          </div>
        ) : (
          <EmptyState icon={Users} title={en.queue.noFarmersWaiting} />
        )}
      </CardContent>
    </Card>
  );
}
