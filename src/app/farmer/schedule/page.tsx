import { CalendarDays } from "lucide-react";

import { AppointmentCard } from "@/components/farmer/appointment-card";
import { FarmerTabs } from "@/components/farmer/farmer-tabs";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { en } from "@/i18n/en";
import { getUpcomingAppointments } from "@/lib/demo/farmer-demo-data";

export default function FarmerSchedulePage() {
  const appointments = getUpcomingAppointments();

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <FarmerTabs />
      <PageHeader
        title={en.farmer.yourSchedule}
        description="All of your scheduled and in-progress procurement appointments."
      />

      {appointments.length === 0 ? (
        <EmptyState icon={CalendarDays} title={en.farmer.noSchedule} />
      ) : (
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <AppointmentCard key={appointment.id} appointment={appointment} />
          ))}
        </div>
      )}
    </div>
  );
}
