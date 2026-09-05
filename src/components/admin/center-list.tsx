"use client";

import { useState } from "react";
import { AlertTriangle, Building2, Pencil } from "lucide-react";

import { CenterForm } from "@/components/admin/center-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { en } from "@/i18n/en";
import { updateCenter } from "@/services/centers";
import { useAdminCenters } from "@/hooks/use-admin-centers";

export function CenterList() {
  const { centers, loading, error } = useAdminCenters();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [toggleError, setToggleError] = useState<string | null>(null);

  async function handleToggleActive(centerId: string, nextActive: boolean) {
    setToggleError(null);
    setTogglingId(centerId);
    try {
      await updateCenter(centerId, { active: nextActive });
    } catch {
      setToggleError("Could not update this center right now.");
    } finally {
      setTogglingId(null);
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  if (error) {
    return <EmptyState icon={AlertTriangle} title="Couldn't load centers" description={error} />;
  }

  if (centers.length === 0) {
    return <EmptyState icon={Building2} title={en.admin.noCenters} />;
  }

  return (
    <ul className="space-y-3">
      {toggleError ? (
        <p role="alert" className="text-sm text-destructive">
          {toggleError}
        </p>
      ) : null}
      {centers.map((center) => (
        <li key={center.id}>
          {editingId === center.id ? (
            <CenterForm center={center} onDone={() => setEditingId(null)} />
          ) : (
            <Card>
              <CardContent className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{center.name}</p>
                    <Badge variant={center.active ? "default" : "secondary"}>
                      {center.active ? en.admin.centerActive : en.admin.centerInactive}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {center.code} · {center.district}, {center.state}
                  </p>
                  <p className="text-sm text-muted-foreground">{center.address}</p>
                  <p className="text-xs text-muted-foreground">
                    {center.contactPhone} · {center.operatingStart}–{center.operatingEnd}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button size="sm" variant="outline" onClick={() => setEditingId(center.id)}>
                    <Pencil className="size-4" aria-hidden="true" />
                    {en.admin.editCenter}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    disabled={togglingId === center.id}
                    onClick={() => handleToggleActive(center.id, !center.active)}
                  >
                    {center.active ? en.admin.deactivate : en.admin.activate}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </li>
      ))}
    </ul>
  );
}
