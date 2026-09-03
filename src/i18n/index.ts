import { en } from "./en";

/** Only English is implemented in Day 1; Marathi/Hindi are P2 (CLAUDE.md §13). */
export const translations = { en } as const;
export type Locale = keyof typeof translations;

export function getTranslations(locale: Locale = "en") {
  return translations[locale];
}
