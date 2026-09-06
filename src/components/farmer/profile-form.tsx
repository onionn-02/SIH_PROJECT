"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslations } from "@/hooks/use-translations";
import { useAuth } from "@/lib/auth/auth-context";
import { updateOwnProfile } from "@/services/profile";
import type { Profile } from "@/types/firestore";

/** Self-service edit of name/phone/language (CLAUDE.md §7 Profile). Rendered only once RouteGuard has resolved the profile. */
export function ProfileForm({ profile, email }: { profile: Profile; email: string | null }) {
  const t = useTranslations();
  const { user } = useAuth();
  const [fullName, setFullName] = useState(profile.full_name);
  const [phone, setPhone] = useState(profile.phone);
  const [language, setLanguage] = useState<Profile["preferred_language"]>(profile.preferred_language);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const languageOptions: { value: Profile["preferred_language"]; label: string }[] = [
    { value: "en", label: t.farmer.profile.languageEnglish },
    { value: "hi", label: t.farmer.profile.languageHindi },
    { value: "mr", label: t.farmer.profile.languageMarathi },
  ];

  const roleLabel: Record<Profile["role"], string> = {
    farmer: t.admin.roleFarmer,
    officer: t.admin.roleOfficer,
    admin: t.admin.roleAdmin,
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await updateOwnProfile(user.uid, {
        full_name: fullName.trim(),
        phone: phone.trim(),
        preferred_language: language,
      });
      setSaved(true);
    } catch {
      setError(t.farmer.profile.updateFailed);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t.farmer.profile.title}</CardTitle>
        <CardDescription>{t.farmer.profile.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="profile-name">{t.farmer.profile.fullName}</Label>
            <Input
              id="profile-name"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="profile-phone">{t.farmer.profile.phone}</Label>
            <Input
              id="profile-phone"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="profile-language">{t.farmer.profile.preferredLanguage}</Label>
            <select
              id="profile-language"
              value={language}
              onChange={(e) => setLanguage(e.target.value as Profile["preferred_language"])}
              className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            >
              {languageOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t pt-4 text-sm">
            <div>
              <p className="text-muted-foreground">{t.farmer.profile.email}</p>
              <p className="font-medium">{email ?? "—"}</p>
            </div>
            <div>
              <p className="text-muted-foreground">{t.farmer.profile.role}</p>
              <p className="font-medium">{roleLabel[profile.role]}</p>
            </div>
          </div>

          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
          {saved ? <p className="text-sm text-emerald-600 dark:text-emerald-400">{t.farmer.profile.saved}</p> : null}

          <Button type="submit" disabled={saving}>
            {saving ? t.farmer.profile.saving : t.farmer.profile.save}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
