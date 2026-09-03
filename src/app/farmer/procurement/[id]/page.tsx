import Link from "next/link";
import { ArrowLeft, MapPin, Phone, SearchX } from "lucide-react";

import { StatusBadge } from "@/components/farmer/status-badge";
import { StatusTimeline } from "@/components/farmer/status-timeline";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ROUTES } from "@/config/routes";
import { en } from "@/i18n/en";
import { getAppointmentById } from "@/lib/demo/farmer-demo-data";

export default async function ProcurementDetailsPage({
  params,
}: PageProps<"/farmer/procurement/[id]">) {
  const { id } = await params;
  const appointment = getAppointmentById(id);

  if (!appointment) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <PageHeader title={en.farmer.appointmentNotFound} />
        <EmptyState
          icon={SearchX}
          title={en.farmer.appointmentNotFound}
          description={en.farmer.appointmentNotFoundHint}
          action={
            <Link
              href={ROUTES.farmer.schedule}
              className="mt-2 text-sm font-medium text-primary hover:underline"
            >
              {en.farmer.backToDashboard}
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <Link
        href={ROUTES.farmer.dashboard}
        className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {en.farmer.backToDashboard}
      </Link>

      <PageHeader
        title={`${appointment.commodity} — Token ${appointment.tokenNumber}`}
        description={`${appointment.dateLabel} at ${appointment.timeSlot}`}
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <StatusBadge status={appointment.status} />
        {appointment.queuePosition != null ? (
          <span className="text-sm text-muted-foreground">
            {en.farmer.queuePosition}:{" "}
            <strong className="text-foreground">#{appointment.queuePosition}</strong>
          </span>
        ) : null}
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">{en.farmer.status}</CardTitle>
        </CardHeader>
        <CardContent>
          <StatusTimeline
            status={appointment.status}
            statusHistory={appointment.statusHistory}
            cancellationReason={appointment.cancellationReason}
          />
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">{en.farmer.center}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="font-medium">{appointment.center.name}</p>
          <p className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="size-4 shrink-0" aria-hidden="true" />
            {appointment.center.address}, {appointment.center.district}, {appointment.center.state}
          </p>
          <p className="flex items-center gap-1.5 text-muted-foreground">
            <Phone className="size-4 shrink-0" aria-hidden="true" />
            {appointment.center.contactPhone}
          </p>
        </CardContent>
      </Card>

      {appointment.instructions.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{en.farmer.instructions}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
              {appointment.instructions.map((instruction) => (
                <li key={instruction}>{instruction}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      {appointment.quantity != null ? (
        <p className="mt-4 text-sm text-muted-foreground">
          {en.farmer.quantity}:{" "}
          <span className="font-medium text-foreground">{appointment.quantity} kg</span>
        </p>
      ) : null}
    </div>
  );
}
