export const SUPPORTED_LOCALES = ["en", "es"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LANG_COOKIE = "lang";

export const LANGUAGE_OPTIONS: ReadonlyArray<{ value: Locale; nativeName: string }> = [
  { value: "en", nativeName: "English" },
  { value: "es", nativeName: "Español" },
];

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && SUPPORTED_LOCALES.some((locale) => locale === value);
}
