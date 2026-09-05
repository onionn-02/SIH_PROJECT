"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

import { AdminTabs } from "@/components/admin/admin-tabs";
import { ScheduleForm } from "@/components/admin/schedule-form";
import { ScheduleList } from "@/components/admin/schedule-list";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { en } from "@/i18n/en";

export default function AdminSchedulesPage() {
  const [showAddForm, setShowAddForm] = useState(false);

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <AdminTabs />
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <PageHeader title={en.nav.adminSchedules} description={en.admin.schedulesDescription} />
        {!showAddForm ? (
          <Button size="sm" onClick={() => setShowAddForm(true)}>
            <Plus className="size-4" aria-hidden="true" />
            {en.admin.addSchedule}
          </Button>
        ) : null}
      </div>

      {showAddForm ? (
        <div className="mb-6">
          <ScheduleForm onDone={() => setShowAddForm(false)} />
        </div>
      ) : null}

      <ScheduleList />
    </div>
  );
}
