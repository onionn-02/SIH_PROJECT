"use client";

import { useState } from "react";
import { AlertTriangle, CalendarDays, Pencil } from "lucide-react";

import { ScheduleForm } from "@/components/admin/schedule-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { en } from "@/i18n/en";
import { useAuth } from "@/lib/auth/auth-context";
import { cancelSchedule, publishSchedule } from "@/services/schedules";
import { useAdminSchedules } from "@/hooks/use-admin-schedules";
import type { ScheduleStatus } from "@/types/firestore";

const STATUS_BADGE: Record<ScheduleStatus, "default" | "secondary" | "destructive"> = {
  draft: "secondary",
  published: "default",
  cancelled: "destructive",
};

export function ScheduleList() {
  const { schedules, loading, error } = useAdminSchedules();
  const { user } = useAuth();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleCancel(id: string) {
    if (!user) return;
    if (!window.confirm(en.admin.confirmCancelSchedule)) return;
    setActionError(null);
    setCancellingId(id);
    try {
      const count = await cancelSchedule(id, user.uid);
      setFeedback(en.admin.scheduleCancelled(count));
    } catch {
      setActionError("Could not cancel this schedule right now.");
    } finally {
      setCancellingId(null);
    }
  }

  async function handlePublish(id: string) {
    setActionError(null);
    setPublishingId(id);
    try {
      await publishSchedule(id);
    } catch {
      setActionError("Could not publish this schedule right now.");
    } finally {
      setPublishingId(null);
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
    return <EmptyState icon={AlertTriangle} title="Couldn't load schedules" description={error} />;
  }

  if (schedules.length === 0) {
    return <EmptyState icon={CalendarDays} title={en.admin.noSchedules} />;
  }

  return (
    <div className="space-y-3">
      {actionError ? (
        <p role="alert" className="text-sm text-destructive">
          {actionError}
        </p>
      ) : null}
      {feedback ? <p className="text-sm text-emerald-600">{feedback}</p> : null}
      <ul className="space-y-3">
        {schedules.map((schedule) => (
          <li key={schedule.id}>
            {editingId === schedule.id ? (
              <ScheduleForm schedule={schedule} onDone={() => setEditingId(null)} />
            ) : (
              <Card>
                <CardContent className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {schedule.commodity} · {schedule.centerName}
                      </p>
                      <Badge variant={STATUS_BADGE[schedule.status]}>
                        {en.admin.scheduleStatus[schedule.status]}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {schedule.dateLabel} · {schedule.startTime}–{schedule.endTime} · Capacity{" "}
                      {schedule.capacity}
                    </p>
                    {schedule.notes ? (
                      <p className="text-xs text-muted-foreground">{schedule.notes}</p>
                    ) : null}
                  </div>
                  {schedule.status !== "cancelled" ? (
                    <div className="flex shrink-0 flex-wrap gap-2">
                      <Button size="sm" variant="outline" onClick={() => setEditingId(schedule.id)}>
                        <Pencil className="size-4" aria-hidden="true" />
                        {en.admin.editSchedule}
                      </Button>
                      {schedule.status === "draft" ? (
                        <Button
                          size="sm"
                          disabled={publishingId === schedule.id}
                          onClick={() => handlePublish(schedule.id)}
                        >
                          {en.admin.publish}
                        </Button>
                      ) : null}
                      <Button
                        size="sm"
                        variant="ghost"
                        disabled={cancellingId === schedule.id}
                        onClick={() => handleCancel(schedule.id)}
                      >
                        {en.admin.cancelSchedule}
                      </Button>
                    </div>
                  ) : null}
                </CardContent>
              </Card>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
