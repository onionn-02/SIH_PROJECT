import { AlertTriangle, Check, XCircle } from "lucide-react";

import { en } from "@/i18n/en";
import { cn } from "@/lib/utils";
import type { DemoStatusStep } from "@/lib/demo/types";
import type { AppointmentStatus } from "@/types/firestore";

interface StatusTimelineProps {
  status: AppointmentStatus;
  statusHistory: DemoStatusStep[];
  cancellationReason?: string | null;
}

const DISPLAY_INDEX: Partial<Record<AppointmentStatus, number>> = {
  SCHEDULED: 0,
  WAITING: 1,
  CALLED: 2,
  IN_PROGRESS: 2,
  COMPLETED: 3,
};

function findTimestamp(history: DemoStatusStep[], statuses: AppointmentStatus[]): string | null {
  for (const s of statuses) {
    const found = history.find((h) => h.status === s);
    if (found?.timestamp) return found.timestamp;
  }
  return null;
}

/**
 * Farmer-facing status timeline (CLAUDE.md §6): four plain-language steps.
 * CANCELLED and NO_SHOW are terminal states shown as a banner instead of
 * forcing them into the step sequence.
 */
export function StatusTimeline({ status, statusHistory, cancellationReason }: StatusTimelineProps) {
  if (status === "CANCELLED") {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
        <XCircle className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden="true" />
        <div>
          <p className="font-medium text-destructive">{en.timeline.cancelledTitle}</p>
          {cancellationReason ? (
            <p className="mt-1 text-sm text-muted-foreground">{cancellationReason}</p>
          ) : null}
        </div>
      </div>
    );
  }

  if (status === "NO_SHOW") {
    return (
      <div className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
        <AlertTriangle className="mt-0.5 size-5 shrink-0 text-destructive" aria-hidden="true" />
        <div>
          <p className="font-medium text-destructive">{en.timeline.noShowTitle}</p>
          <p className="mt-1 text-sm text-muted-foreground">{en.timeline.noShowBody}</p>
        </div>
      </div>
    );
  }

  const currentIndex = DISPLAY_INDEX[status] ?? 0;

  const calledInProgressLabel =
    status === "CALLED"
      ? en.status.CALLED
      : status === "IN_PROGRESS" || currentIndex > 2
        ? en.status.IN_PROGRESS
        : en.timeline.calledInProgress;

  const steps = [
    {
      label: en.timeline.scheduled,
      timestamp: findTimestamp(statusHistory, ["SCHEDULED"]),
    },
    {
      label: en.timeline.waiting,
      timestamp: findTimestamp(statusHistory, ["WAITING"]),
    },
    {
      label: calledInProgressLabel,
      timestamp: findTimestamp(statusHistory, ["CALLED", "IN_PROGRESS"]),
    },
    {
      label: en.timeline.completed,
      timestamp: findTimestamp(statusHistory, ["COMPLETED"]),
    },
  ];

  return (
    <ol className="space-y-0">
      {steps.map((step, index) => {
        const reached = index <= currentIndex;
        const isCurrent = index === currentIndex && status !== "COMPLETED";
        const isLast = index === steps.length - 1;

        return (
          <li key={step.label} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex size-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-medium",
                  reached
                    ? "border-emerald-600 bg-emerald-600 text-white dark:border-emerald-500 dark:bg-emerald-500"
                    : "border-border bg-background text-muted-foreground",
                  isCurrent && "ring-2 ring-emerald-600/30 dark:ring-emerald-500/30"
                )}
                aria-hidden="true"
              >
                {reached ? <Check className="size-3.5" /> : null}
              </span>
              {!isLast ? (
                <span
                  className={cn(
                    "w-0.5 flex-1 min-h-6",
                    index < currentIndex ? "bg-emerald-600 dark:bg-emerald-500" : "bg-border"
                  )}
                  aria-hidden="true"
                />
              ) : null}
            </div>
            <div className={cn("pb-6", isLast && "pb-0")}>
              <p
                className={cn(
                  "text-sm font-medium",
                  reached ? "text-foreground" : "text-muted-foreground",
                  isCurrent && "text-emerald-700 dark:text-emerald-400"
                )}
              >
                {step.label}
                {isCurrent ? (
                  <span className="ml-2 text-xs font-normal text-emerald-700 dark:text-emerald-400">
                    (current)
                  </span>
                ) : null}
              </p>
              <p className="text-xs text-muted-foreground">
                {step.timestamp ?? en.timeline.notYet}
              </p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
