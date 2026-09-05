import { SectionTabs } from "@/components/shared/section-tabs";
import { ROUTES } from "@/config/routes";
import { en } from "@/i18n/en";

const TABS = [
  { href: ROUTES.farmer.dashboard, label: en.nav.farmerDashboard },
  { href: ROUTES.farmer.schedule, label: en.nav.schedule },
  { href: ROUTES.farmer.history, label: en.nav.history },
  { href: ROUTES.farmer.notifications, label: en.nav.notifications },
];

/** Sub-navigation between the farmer's own screens. */
export function FarmerTabs() {
  return <SectionTabs tabs={TABS} ariaLabel="Farmer sections" />;
}
