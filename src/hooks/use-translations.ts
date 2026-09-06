"use client";

import { getTranslations, type Locale } from "@/i18n";
import { useAuth } from "@/lib/auth/auth-context";

/**
 * The signed-in user's own translation set, driven by their saved
 * `preferred_language` (CLAUDE.md §13) — editable on the farmer profile
 * page. Falls back to English before the profile has loaded or for an
 * unrecognized value, so no screen ever renders with missing strings.
 */
export function useTranslations() {
  const { profile } = useAuth();
  const locale = (profile?.preferred_language ?? "en") as Locale;
  return getTranslations(locale);
}
