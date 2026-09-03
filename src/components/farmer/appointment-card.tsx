import Link from "next/link";
import { ChevronRight, MapPin, Ticket, Users, type LucideIcon } from "lucide-react";

import { StatusBadge } from "@/components/farmer/status-badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/config/routes";
import { en } from "@/i18n/en";
import { cn } from "@/lib/utils";
import type { DemoAppointment } from "@/lib/demo/types";

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
          <Stat label={en.farmer.date} value={appointment.dateLabel} />
          <Stat label={en.farmer.time} value={appointment.timeSlot} />
          <Stat label={en.farmer.token} value={appointment.tokenNumber} emphasize icon={Ticket} />
          <Stat
            label={en.farmer.queuePosition}
            value={appointment.queuePosition != null ? `#${appointment.queuePosition}` : "—"}
            emphasize={appointment.queuePosition != null}
            icon={Users}
          />
        </div>
        <div className="flex items-center justify-between border-t pt-3 text-sm">
          <span className="text-muted-foreground">{appointment.commodity}</span>
          <Link
            href={ROUTES.farmer.procurement(appointment.id)}
            className="inline-flex items-center gap-1 font-medium text-primary hover:underline"
          >
            {en.farmer.viewDetails}
            <ChevronRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

/** Compact row used for past procurement records in the history list. */
export function HistoryCard({ appointment }: { appointment: DemoAppointment }) {
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
              {en.farmer.quantity}: {appointment.quantity} kg
            </p>
          ) : null}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <StatusBadge status={appointment.status} />
          <Link
            href={ROUTES.farmer.procurement(appointment.id)}
            className="text-xs font-medium text-primary hover:underline"
          >
            {en.farmer.viewDetails}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
