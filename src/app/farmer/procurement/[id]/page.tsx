"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { AlertTriangle, ArrowLeft, MapPin, Phone, SearchX } from "lucide-react";

import { PaymentStatusBadge } from "@/components/farmer/payment-status-badge";
import { StatusBadge } from "@/components/farmer/status-badge";
import { StatusTimeline } from "@/components/farmer/status-timeline";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/config/routes";
import { useFarmerAppointments } from "@/hooks/use-farmer-appointments";
import { useMyQueuePosition } from "@/hooks/use-my-queue-position";
import { useTranslations } from "@/hooks/use-translations";

export default function ProcurementDetailsPage() {
  const t = useTranslations();
  const { id } = useParams<{ id: string }>();
  const { appointments, loading, error } = useFarmerAppointments();
  const appointment = appointments.find((a) => a.id === id) ?? null;

  const queuePosition = useMyQueuePosition(appointment?.id ?? null, appointment?.status);
  const displayed = appointment ? { ...appointment, queuePosition } : appointment;

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl space-y-4 px-4 py-8">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-40 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <PageHeader title={t.farmer.loadErrorAppointmentDetails} />
        <EmptyState icon={AlertTriangle} title={t.farmer.loadErrorAppointmentDetails} description={error} />
      </div>
    );
  }

  if (!displayed) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-8">
        <PageHeader title={t.farmer.appointmentNotFound} />
        <EmptyState
          icon={SearchX}
          title={t.farmer.appointmentNotFound}
          description={t.farmer.appointmentNotFoundHint}
          action={
            <Link
              href={ROUTES.farmer.schedule}
              className="mt-2 text-sm font-medium text-primary hover:underline"
            >
              {t.farmer.backToDashboard}
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
        {t.farmer.backToDashboard}
      </Link>

      <PageHeader
        title={`${displayed.commodity} — Token ${displayed.tokenNumber}`}
        description={`${displayed.dateLabel} at ${displayed.timeSlot}`}
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <StatusBadge status={displayed.status} />
        {displayed.queuePosition != null ? (
          <span className="text-sm text-muted-foreground">
            {t.farmer.queuePosition}:{" "}
            <strong className="text-foreground">#{displayed.queuePosition}</strong>
          </span>
        ) : null}
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">{t.farmer.status}</CardTitle>
        </CardHeader>
        <CardContent>
          <StatusTimeline
            status={displayed.status}
            statusHistory={displayed.statusHistory}
            cancellationReason={displayed.cancellationReason}
          />
        </CardContent>
      </Card>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">{t.farmer.center}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p className="font-medium">{displayed.center.name}</p>
          <p className="flex items-center gap-1.5 text-muted-foreground">
            <MapPin className="size-4 shrink-0" aria-hidden="true" />
            {displayed.center.address}, {displayed.center.district}, {displayed.center.state}
          </p>
          <p className="flex items-center gap-1.5 text-muted-foreground">
            <Phone className="size-4 shrink-0" aria-hidden="true" />
            {displayed.center.contactPhone}
          </p>
        </CardContent>
      </Card>

      {displayed.paymentStatus ? (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">{t.farmer.paymentStatus}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <PaymentStatusBadge status={displayed.paymentStatus} />
            <p className="text-xs text-muted-foreground">{t.farmer.paymentDemoNote}</p>
          </CardContent>
        </Card>
      ) : null}

      {displayed.instructions.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{t.farmer.instructions}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted-foreground">
              {displayed.instructions.map((instruction) => (
                <li key={instruction}>{instruction}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}

      {displayed.quantity != null ? (
        <p className="mt-4 text-sm text-muted-foreground">
          {t.farmer.quantity}:{" "}
          <span className="font-medium text-foreground">{displayed.quantity} kg</span>
        </p>
      ) : null}
    </div>
  );
}
