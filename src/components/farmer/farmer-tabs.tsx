import { SectionTabs } from "@/components/shared/section-tabs";
import { ROUTES } from "@/config/routes";
import { useNotifications } from "@/hooks/use-notifications";
import { useTranslations } from "@/hooks/use-translations";

/** Sub-navigation between the farmer's own screens. */
export function FarmerTabs() {
  const t = useTranslations();
  const { notifications } = useNotifications();
  const unreadCount = notifications.filter((n) => !n.read).length;

  const tabs = [
    { href: ROUTES.farmer.dashboard, label: t.nav.farmerDashboard },
    { href: ROUTES.farmer.schedule, label: t.nav.schedule },
    { href: ROUTES.farmer.history, label: t.nav.history },
    {
      href: ROUTES.farmer.notifications,
      label: t.nav.notifications,
      count: unreadCount,
      countLabel: t.farmer.unreadNotifications(unreadCount),
    },
    { href: ROUTES.farmer.profile, label: t.nav.profile },
  ];
  return <SectionTabs tabs={tabs} ariaLabel="Farmer sections" />;
}
