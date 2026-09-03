import { OfficerTabs } from "@/components/officer/officer-tabs";
import { QueueBoard } from "@/components/officer/queue-board";
import { PageHeader } from "@/components/shared/page-header";
import { en } from "@/i18n/en";

export default function OfficerQueuePage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <OfficerTabs />
      <PageHeader
        title={en.nav.officerQueue}
        description="Search, filter and progress today's appointments."
      />

      <QueueBoard />
    </div>
  );
}
