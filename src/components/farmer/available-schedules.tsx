"use client";

import { useState } from "react";
import { AlertTriangle, CalendarPlus } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/lib/auth/auth-context";
import { bookAppointment } from "@/services/booking";
import { useBookableSchedules } from "@/hooks/use-bookable-schedules";
import { useTranslations } from "@/hooks/use-translations";

/** Farmer self-booking (CLAUDE.md §5 booking step, Day 7 P0 gap fix). */
export function AvailableSchedules() {
  const t = useTranslations();
  const { user, profile } = useAuth();
  const { schedules, loading, error } = useBookableSchedules();
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  async function handleBook(scheduleId: string) {
    if (!user || !profile) return;
    setBookingId(scheduleId);
    setActionError(null);
    setFeedback(null);
    try {
      const result = await bookAppointment({
        scheduleId,
        farmerId: user.uid,
        farmerName: profile.full_name,
        farmerPhone: profile.phone,
      });
      setFeedback(t.farmer.bookingConfirmed(result.tokenNumber));
    } catch (err) {
      setActionError(err instanceof Error ? err.message : t.farmer.bookingFailed);
    } finally {
      setBookingId(null);
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold">{t.farmer.availableSchedules}</h2>
        <p className="text-sm text-muted-foreground">{t.farmer.availableSchedulesDescription}</p>
      </div>

      {actionError ? (
        <p role="alert" className="text-sm text-destructive">
          {actionError}
        </p>
      ) : null}
      {feedback ? <p className="text-sm text-emerald-600">{feedback}</p> : null}

      {loading ? (
        <Skeleton className="h-24 w-full" />
      ) : error ? (
        <EmptyState icon={AlertTriangle} title={t.farmer.loadErrorAvailableSchedules} description={error} />
      ) : schedules.length === 0 ? (
        <EmptyState icon={CalendarPlus} title={t.farmer.noAvailableSchedules} />
      ) : (
        <ul className="space-y-3">
          {schedules.map((schedule) => (
            <li key={schedule.id}>
              <Card>
                <CardContent className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">
                        {schedule.commodity} · {schedule.centerName}
                      </p>
                      <Badge variant="secondary">{t.farmer.slotsRemaining(schedule.slotsRemaining)}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {schedule.dateLabel} · {schedule.startTime}–{schedule.endTime}
                    </p>
                  </div>
                  <Button
                    size="sm"
                    disabled={bookingId === schedule.id}
                    onClick={() => handleBook(schedule.id)}
                  >
                    {bookingId === schedule.id ? t.farmer.booking : t.farmer.bookSlot}
                  </Button>
                </CardContent>
              </Card>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
