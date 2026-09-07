"use client";

import { AlertTriangle, ShieldCheck } from "lucide-react";

import { AdminTabs } from "@/components/admin/admin-tabs";
import { AnnouncementForm } from "@/components/admin/announcement-form";
import { StatCards } from "@/components/admin/stat-cards";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";
import { en } from "@/i18n/en";
import { useAdminDashboard } from "@/hooks/use-admin-dashboard";

export default function AdminDashboardPage() {
  const { stats, loading, error } = useAdminDashboard();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <AdminTabs />
      <PageHeader title={en.nav.adminDashboard} description={en.admin.dashboardDescription} icon={ShieldCheck} />

      {error ? (
        <EmptyState icon={AlertTriangle} title="Couldn't load dashboard data" description={error} />
      ) : (
        <div className="space-y-6">
          <StatCards stats={stats} loading={loading} />
          <AnnouncementForm />
        </div>
      )}
    </div>
  );
}
