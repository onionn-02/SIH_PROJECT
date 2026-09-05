"use client";

import { CheckCircle2, PhoneCall, PlayCircle, UserX, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { en } from "@/i18n/en";
import { useOfficerQueue, type QueueEntry } from "@/lib/officer/queue-context";

/**
 * Renders only the actions valid for the appointment's current status
 * (CLAUDE.md §5, §9) — the officer can never trigger an invalid transition
 * because the button for it simply doesn't exist.
 */
export function QueueActions({ appointment }: { appointment: QueueEntry }) {
  const { checkIn, callNext, startProcurement, completeProcurement, markNoShow, cancelAppointment, isPending } =
    useOfficerQueue();
  const pending = isPending(appointment.id);

  switch (appointment.status) {
    case "SCHEDULED":
      return (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" disabled={pending} onClick={() => checkIn(appointment.id)}>
            {en.queue.checkIn}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={pending}
            onClick={() => {
              if (window.confirm(en.queue.confirmCancel)) cancelAppointment(appointment.id);
            }}
          >
            <XCircle className="size-4" aria-hidden="true" />
            {en.queue.cancel}
          </Button>
        </div>
      );

    case "WAITING":
      return (
        <div className="flex flex-wrap items-center gap-2">
          {appointment.queuePosition === 1 ? (
            <Button size="sm" disabled={pending} onClick={() => callNext(appointment.id)}>
              <PhoneCall className="size-4" aria-hidden="true" />
              {en.queue.call}
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground">{en.queue.waitingForTurn}</span>
          )}
          <Button
            size="sm"
            variant="ghost"
            disabled={pending}
            onClick={() => {
              if (window.confirm(en.queue.confirmNoShow)) markNoShow(appointment.id);
            }}
          >
            <UserX className="size-4" aria-hidden="true" />
            {en.officer.noShow}
          </Button>
        </div>
      );

    case "CALLED":
      return (
        <div className="flex flex-wrap gap-2">
          <Button size="sm" disabled={pending} onClick={() => startProcurement(appointment.id)}>
            <PlayCircle className="size-4" aria-hidden="true" />
            {en.officer.startProcurement}
          </Button>
          <Button
            size="sm"
            variant="ghost"
            disabled={pending}
            onClick={() => {
              if (window.confirm(en.queue.confirmNoShow)) markNoShow(appointment.id);
            }}
          >
            <UserX className="size-4" aria-hidden="true" />
            {en.officer.noShow}
          </Button>
        </div>
      );

    case "IN_PROGRESS":
      return (
        <Button size="sm" disabled={pending} onClick={() => completeProcurement(appointment.id)}>
          <CheckCircle2 className="size-4" aria-hidden="true" />
          {en.officer.completeProcurement}
        </Button>
      );

    default:
      return <span className="text-xs text-muted-foreground">—</span>;
  }
}
