import Link from "next/link";
import { CalendarDays } from "lucide-react";

import { AppointmentCard } from "@/components/farmer/appointment-card";
import { FarmerTabs } from "@/components/farmer/farmer-tabs";
import { NotificationList } from "@/components/farmer/notification-list";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";
import { en } from "@/i18n/en";
import {
  DEMO_FARMER_NAME,
  DEMO_NOTIFICATIONS,
  getPrimaryAppointment,
} from "@/lib/demo/farmer-demo-data";

export default function FarmerDashboardPage() {
  const appointment = getPrimaryAppointment();
  const recentNotifications = DEMO_NOTIFICATIONS.slice(0, 3);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <FarmerTabs />
      <PageHeader
        title={`${en.farmer.greeting}, ${DEMO_FARMER_NAME.split(" ")[0]}`}
        description="Here's what's happening with your procurement."
      />

      <section aria-labelledby="upcoming-heading" className="mb-8">
        <h2
          id="upcoming-heading"
          className="mb-3 text-sm font-semibold tracking-wide text-muted-foreground uppercase"
        >
          {en.farmer.upcomingAppointment}
        </h2>
        {appointment ? (
          <AppointmentCard appointment={appointment} highlight />
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
        <NotificationList notifications={recentNotifications} />
      </section>
    </div>
  );
}
