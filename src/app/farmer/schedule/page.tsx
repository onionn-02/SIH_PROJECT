"use client";

import { AlertTriangle, CalendarDays } from "lucide-react";

import { AppointmentCard } from "@/components/farmer/appointment-card";
import { FarmerTabs } from "@/components/farmer/farmer-tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Skeleton } from "@/components/ui/skeleton";
import { en } from "@/i18n/en";
import { useFarmerAppointments } from "@/hooks/use-farmer-appointments";
import { useMyQueuePosition } from "@/hooks/use-my-queue-position";
import { getUpcomingAppointments } from "@/lib/appointments/derive";
import type { DemoAppointment } from "@/lib/demo/types";

/** One list row with its own live queue-position fetch (a hook can't run inside the .map() below). */
function ScheduleAppointmentCard({ appointment }: { appointment: DemoAppointment }) {
  const queuePosition = useMyQueuePosition(appointment.id, appointment.status);
  return <AppointmentCard appointment={{ ...appointment, queuePosition }} />;
}

export default function FarmerSchedulePage() {
  const { appointments, loading, error } = useFarmerAppointments();
  const upcoming = getUpcomingAppointments(appointments);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <FarmerTabs />
      <PageHeader
        title={en.farmer.yourSchedule}
        description="All of your scheduled and in-progress procurement appointments."
      />

      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      ) : error ? (
        <EmptyState icon={AlertTriangle} title="Couldn't load your schedule" description={error} />
      ) : upcoming.length === 0 ? (
        <EmptyState icon={CalendarDays} title={en.farmer.noSchedule} />
      ) : (
        <div className="space-y-4">
          {upcoming.map((appointment) => (
            <ScheduleAppointmentCard key={appointment.id} appointment={appointment} />
          ))}
        </div>
      )}
    </div>
  );
}
