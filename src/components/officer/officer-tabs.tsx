import { SectionTabs } from "@/components/shared/section-tabs";
import { ROUTES } from "@/config/routes";
import { en } from "@/i18n/en";

const TABS = [
  { href: ROUTES.officer.dashboard, label: en.nav.officerDashboard },
  { href: ROUTES.officer.queue, label: en.nav.officerQueue },
  { href: ROUTES.officer.history, label: en.nav.officerHistory },
  { href: ROUTES.officer.prices, label: en.nav.officerPrices },
];

/** Sub-navigation between the officer's own screens. */
export function OfficerTabs() {
  return <SectionTabs tabs={TABS} ariaLabel="Officer sections" />;
}
