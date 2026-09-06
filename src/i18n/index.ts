import { en } from "./en";
import { hi } from "./hi";
import { mr } from "./mr";

export const translations = { en, hi, mr } as const;
export type Locale = keyof typeof translations;

export function getTranslations(locale: Locale = "en") {
  return translations[locale];
}
