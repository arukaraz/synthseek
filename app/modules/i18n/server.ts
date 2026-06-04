import { cookies } from "next/headers";
import { createInstance } from "i18next";

import { DEFAULT_LOCALE, isLocale, LANG_COOKIE, type Locale } from "./config";
import { resources } from "./resources";

export async function getServerLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get(LANG_COOKIE)?.value;
  return isLocale(value) ? value : DEFAULT_LOCALE;
}

export async function getServerT(locale?: Locale) {
  const lng = locale ?? (await getServerLocale());
  const instance = createInstance();
  await instance.init({
    resources,
    lng,
    fallbackLng: DEFAULT_LOCALE,
    defaultNS: "common",
    interpolation: { escapeValue: false },
  });
  return instance.t.bind(instance);
}
