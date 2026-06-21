export const SUPPORTED_LOCALES = ["en", "es", "de", "fr"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LANG_COOKIE = "lang";

export const LANGUAGE_OPTIONS: ReadonlyArray<{ value: Locale; nativeName: string }> = [
  { value: "en", nativeName: "English" },
  { value: "es", nativeName: "Español" },
  { value: "de", nativeName: "Deutsch" },
  { value: "fr", nativeName: "Français" },
];

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && SUPPORTED_LOCALES.some((locale) => locale === value);
}
