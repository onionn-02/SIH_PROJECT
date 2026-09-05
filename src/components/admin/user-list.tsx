"use client";

import { useState } from "react";
import { AlertTriangle, Pencil, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { en } from "@/i18n/en";
import { useAdminCenters } from "@/hooks/use-admin-centers";
import { useAdminUsers } from "@/hooks/use-admin-users";
import { updateOfficerCenters } from "@/services/users";
import type { AdminUser } from "@/lib/demo/types";
import type { UserRole } from "@/types/firestore";

const ROLE_LABEL: Record<UserRole, string> = {
  farmer: en.admin.roleFarmer,
  officer: en.admin.roleOfficer,
  admin: en.admin.roleAdmin,
};

const ROLE_BADGE: Record<UserRole, "default" | "secondary"> = {
  admin: "default",
  officer: "secondary",
  farmer: "secondary",
};

function OfficerCenterEditor({ user, onDone }: { user: AdminUser; onDone: () => void }) {
  const { centers } = useAdminCenters();
  const [selected, setSelected] = useState<Set<string>>(new Set(user.assignedCenterIds));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(centerId: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(centerId)) next.delete(centerId);
      else next.add(centerId);
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await updateOfficerCenters(user.id, Array.from(selected));
      onDone();
    } catch {
      setError("Could not update assigned centers right now.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="mt-3 space-y-2 border-t pt-3">
      <div className="grid gap-1.5 sm:grid-cols-2">
        {centers.map((center) => (
          <label key={center.id} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={selected.has(center.id)}
              onChange={() => toggle(center.id)}
              className="size-4 rounded border-input"
            />
            {center.name}
            {!center.active ? " (inactive)" : ""}
          </label>
        ))}
      </div>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
      <div className="flex gap-2">
        <Button size="sm" disabled={saving} onClick={handleSave}>
          {saving ? en.admin.saving : en.admin.saveCenters}
        </Button>
        <Button size="sm" variant="ghost" onClick={onDone}>
          {en.admin.cancelForm}
        </Button>
      </div>
    </div>
  );
}

export function UserList() {
  const { users, loading, error } = useAdminUsers();
  const { centers } = useAdminCenters();
  const [editingId, setEditingId] = useState<string | null>(null);
  const centerNames = new Map(centers.map((c) => [c.id, c.name]));

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (error) {
    return <EmptyState icon={AlertTriangle} title="Couldn't load users" description={error} />;
  }

  if (users.length === 0) {
    return <EmptyState icon={Users} title={en.admin.noUsers} />;
  }

  return (
    <ul className="space-y-3">
      {users.map((user) => (
        <li key={user.id}>
          <Card>
            <CardContent>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{user.fullName}</p>
                    <Badge variant={ROLE_BADGE[user.role]}>{ROLE_LABEL[user.role]}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{user.phone}</p>
                  {user.role === "officer" ? (
                    <p className="mt-1 text-sm text-muted-foreground">
                      {en.admin.assignedCenters}:{" "}
                      {user.assignedCenterIds.length === 0
                        ? en.admin.noCentersAssigned
                        : user.assignedCenterIds.map((id) => centerNames.get(id) ?? id).join(", ")}
                    </p>
                  ) : null}
                </div>
                {user.role === "officer" && editingId !== user.id ? (
                  <Button size="sm" variant="outline" onClick={() => setEditingId(user.id)}>
                    <Pencil className="size-4" aria-hidden="true" />
                    {en.admin.editCenters}
                  </Button>
                ) : null}
              </div>
              {user.role === "officer" && editingId === user.id ? (
                <OfficerCenterEditor user={user} onDone={() => setEditingId(null)} />
              ) : null}
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}
