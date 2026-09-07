"use client";

import { AlertTriangle, CalendarDays, Sprout } from "lucide-react";
import Link from "next/link";

import { AppointmentCard } from "@/components/farmer/appointment-card";
import { FarmerTabs } from "@/components/farmer/farmer-tabs";
import { NotificationList } from "@/components/farmer/notification-list";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ROUTES } from "@/config/routes";
import { useFarmerAppointments } from "@/hooks/use-farmer-appointments";
import { useMyQueuePosition } from "@/hooks/use-my-queue-position";
import { useNotifications } from "@/hooks/use-notifications";
import { useTranslations } from "@/hooks/use-translations";
import { getPrimaryAppointment } from "@/lib/appointments/derive";
import { useAuth } from "@/lib/auth/auth-context";

export default function FarmerDashboardPage() {
  const t = useTranslations();
  const { profile } = useAuth();
  const { appointments, loading, error } = useFarmerAppointments();
  const { notifications } = useNotifications();

  const appointment = getPrimaryAppointment(appointments);
  const queuePosition = useMyQueuePosition(appointment?.id ?? null, appointment?.status);
  const displayedAppointment = appointment ? { ...appointment, queuePosition } : appointment;

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <FarmerTabs />
      <PageHeader
        title={`${t.farmer.greeting}, ${profile?.full_name.split(" ")[0] ?? ""}`}
        description={t.farmer.dashboardDescription}
        icon={Sprout}
      />

      <section aria-labelledby="upcoming-heading" className="mb-8">
        <h2
          id="upcoming-heading"
          className="mb-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase"
        >
          {t.farmer.upcomingAppointment}
        </h2>
        {loading ? (
          <Skeleton className="h-48 w-full" />
        ) : error ? (
          <EmptyState icon={AlertTriangle} title={t.farmer.loadErrorAppointment} description={error} />
        ) : displayedAppointment ? (
          <AppointmentCard appointment={displayedAppointment} highlight />
        ) : (
          <EmptyState
            icon={CalendarDays}
            title={t.farmer.noUpcomingAppointment}
            action={
              <Button render={<Link href={ROUTES.farmer.schedule} />} nativeButton={false} className="mt-2">
                {t.nav.schedule}
              </Button>
            }
          />
        )}
      </section>

      <section aria-labelledby="notifications-heading">
        <div className="mb-3 flex items-center justify-between">
          <h2
            id="notifications-heading"
            className="text-sm font-semibold tracking-wide text-muted-foreground uppercase"
          >
            {t.farmer.recentNotifications}
          </h2>
          {notifications.length > 3 ? (
            <Link
              href={ROUTES.farmer.notifications}
              className="text-sm font-medium text-primary hover:underline"
            >
              {t.farmer.viewAllNotifications}
            </Link>
          ) : null}
        </div>
        <NotificationList notifications={notifications.slice(0, 3)} />
      </section>
    </div>
  );
}
