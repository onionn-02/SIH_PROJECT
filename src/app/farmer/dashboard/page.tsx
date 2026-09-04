"use client";

import { AlertTriangle, CalendarDays } from "lucide-react";
import Link from "next/link";

import { AppointmentCard } from "@/components/farmer/appointment-card";
import { FarmerTabs } from "@/components/farmer/farmer-tabs";
import { NotificationList } from "@/components/farmer/notification-list";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/config/routes";
import { en } from "@/i18n/en";
import { useCenterQueue } from "@/hooks/use-center-queue";
import { useFarmerAppointments } from "@/hooks/use-farmer-appointments";
import { useNotifications } from "@/hooks/use-notifications";
import { getPrimaryAppointment } from "@/lib/appointments/derive";
import { useAuth } from "@/lib/auth/auth-context";

export default function FarmerDashboardPage() {
  const { profile } = useAuth();
  const { appointments, loading, error } = useFarmerAppointments();
  const { notifications } = useNotifications();

  const appointment = getPrimaryAppointment(appointments);
  const { queue } = useCenterQueue(appointment?.center.id ?? null, appointment?.date ?? "");
  const liveEntry = appointment ? queue.find((q) => q.id === appointment.id) : undefined;
  const displayedAppointment =
    appointment && liveEntry
      ? { ...appointment, queuePosition: liveEntry.queuePosition, status: liveEntry.status }
      : appointment;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <FarmerTabs />
      <PageHeader
        title={`${en.farmer.greeting}, ${profile?.full_name.split(" ")[0] ?? ""}`}
        description="Here's what's happening with your procurement."
      />

      <section aria-labelledby="upcoming-heading" className="mb-8">
        <h2
          id="upcoming-heading"
          className="mb-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase"
        >
          {en.farmer.upcomingAppointment}
        </h2>
        {loading ? (
          <Skeleton className="h-48 w-full" />
        ) : error ? (
          <EmptyState icon={AlertTriangle} title="Couldn't load your appointment" description={error} />
        ) : displayedAppointment ? (
          <AppointmentCard appointment={displayedAppointment} highlight />
        ) : (
          <EmptyState
            icon={CalendarDays}
            title={en.farmer.noUpcomingAppointment}
            action={
              <Button render={<Link href={ROUTES.farmer.schedule} />} className="mt-2">
                {en.nav.schedule}
              </Button>
            }
          />
        )}
      </section>

      <section aria-labelledby="notifications-heading">
        <h2
          id="notifications-heading"
          className="mb-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase"
        >
          {en.farmer.recentNotifications}
        </h2>
        <NotificationList notifications={notifications.slice(0, 3)} />
      </section>
    </div>
  );
}
