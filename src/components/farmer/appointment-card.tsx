import Link from "next/link";
import { useState } from "react";
import { ChevronRight, MapPin, Ticket, Users, XCircle, type LucideIcon } from "lucide-react";

import { PaymentStatusBadge } from "@/components/farmer/payment-status-badge";
import { StatusBadge } from "@/components/farmer/status-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/config/routes";
import { useTranslations } from "@/hooks/use-translations";
import { useAuth } from "@/lib/auth/auth-context";
import { cn } from "@/lib/utils";
import { cancelOwnAppointment } from "@/services/booking";
import type { DemoAppointment } from "@/lib/demo/types";

/** Self-cancel action shown only while an appointment is still SCHEDULED (CLAUDE.md §7, firestore.rules). */
function CancelAppointmentButton({ appointmentId }: { appointmentId: string }) {
  const t = useTranslations();
  const { user } = useAuth();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCancel() {
    if (!user || pending) return;
    if (!window.confirm(t.farmer.confirmCancelAppointment)) return;
    setPending(true);
    setError(null);
    try {
      await cancelOwnAppointment(appointmentId, user.uid);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.farmer.cancelAppointmentFailed);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <Button type="button" variant="ghost" size="sm" disabled={pending} onClick={handleCancel}>
        <XCircle className="size-4" aria-hidden="true" />
        {pending ? t.farmer.cancelling : t.farmer.cancelAppointment}
      </Button>
      {error ? (
        <p role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

function Stat({
  label,
  value,
  emphasize,
  icon: Icon,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
  icon?: LucideIcon;
}) {
  return (
    <div className="rounded-lg bg-muted/50 p-3">
      <p className="flex items-center gap-1 text-xs text-muted-foreground">
        {Icon ? <Icon className="size-3.5" aria-hidden="true" /> : null}
        {label}
      </p>
      <p className={cn("mt-1 font-semibold", emphasize ? "text-lg" : "text-sm")}>{value}</p>
    </div>
  );
}

/** Prominent appointment card used on the farmer dashboard and schedule list. */
export function AppointmentCard({
  appointment,
  highlight = false,
}: {
  appointment: DemoAppointment;
  highlight?: boolean;
}) {
  const t = useTranslations();
  return (
    <Card className={highlight ? "ring-2 ring-primary/20" : undefined}>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{appointment.center.name}</CardTitle>
            <CardDescription className="mt-1 flex items-center gap-1">
              <MapPin className="size-3.5" aria-hidden="true" />
              {appointment.center.district}, {appointment.center.state}
            </CardDescription>
          </div>
          <StatusBadge status={appointment.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Stat label={t.farmer.date} value={appointment.dateLabel} />
          <Stat label={t.farmer.time} value={appointment.timeSlot} />
          <Stat label={t.farmer.token} value={appointment.tokenNumber} emphasize icon={Ticket} />
          <Stat
            label={t.farmer.queuePosition}
            value={appointment.queuePosition != null ? `#${appointment.queuePosition}` : "—"}
            emphasize={appointment.queuePosition != null}
            icon={Users}
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t pt-3 text-sm">
          <span className="text-muted-foreground">{appointment.commodity}</span>
          <div className="flex items-center gap-3">
            {appointment.status === "SCHEDULED" ? (
              <CancelAppointmentButton appointmentId={appointment.id} />
            ) : null}
            <Link
              href={ROUTES.farmer.procurement(appointment.id)}
              className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
            >
              {t.farmer.viewDetails}
              <ChevronRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/** Compact row used for past procurement records in the history list. */
export function HistoryCard({ appointment }: { appointment: DemoAppointment }) {
  const t = useTranslations();
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="font-medium">{appointment.commodity}</p>
          <p className="truncate text-sm text-muted-foreground">
            {appointment.dateLabel} · {appointment.center.name}
          </p>
          {appointment.quantity != null ? (
            <p className="text-sm text-muted-foreground">
              {t.farmer.quantity}: {appointment.quantity} kg
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <StatusBadge status={appointment.status} />
          {appointment.paymentStatus ? <PaymentStatusBadge status={appointment.paymentStatus} /> : null}
          <Link
            href={ROUTES.farmer.procurement(appointment.id)}
            className="text-xs font-medium text-primary hover:underline"
          >
            {t.farmer.viewDetails}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
