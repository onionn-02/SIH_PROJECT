import { SectionTabs } from "@/components/shared/section-tabs";
import { ROUTES } from "@/config/routes";
import { en } from "@/i18n/en";

const TABS = [
  { href: ROUTES.admin.dashboard, label: en.nav.adminDashboard },
  { href: ROUTES.admin.users, label: en.nav.adminUsers },
  { href: ROUTES.admin.centers, label: en.nav.adminCenters },
  { href: ROUTES.admin.schedules, label: en.nav.adminSchedules },
  { href: ROUTES.admin.prices, label: en.nav.adminPrices },
  { href: ROUTES.admin.analytics, label: en.nav.adminAnalytics },
];

/** Sub-navigation between the admin's own screens. */
export function AdminTabs() {
  return <SectionTabs tabs={TABS} ariaLabel="Admin sections" />;
}
