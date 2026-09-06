import { HistoryList } from "@/components/officer/history-list";
import { OfficerTabs } from "@/components/officer/officer-tabs";
import { PageHeader } from "@/components/shared/page-header";
import { en } from "@/i18n/en";

export default function OfficerHistoryPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <OfficerTabs />
      <PageHeader title={en.nav.officerHistory} description={en.officer.historyDescription} />

      <HistoryList />
    </div>
  );
}
