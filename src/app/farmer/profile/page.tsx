"use client";

import { FarmerTabs } from "@/components/farmer/farmer-tabs";
import { ProfileForm } from "@/components/farmer/profile-form";
import { PageHeader } from "@/components/shared/page-header";
import { useTranslations } from "@/hooks/use-translations";
import { useAuth } from "@/lib/auth/auth-context";

export default function FarmerProfilePage() {
  const t = useTranslations();
  const { user, profile } = useAuth();

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <FarmerTabs />
      <PageHeader title={t.farmer.profile.title} description={t.farmer.profile.description} />
      {profile ? <ProfileForm profile={profile} email={user?.email ?? null} /> : null}
    </div>
  );
}
