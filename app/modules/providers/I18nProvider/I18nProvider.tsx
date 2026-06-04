"use client";

import { I18nextProvider } from "react-i18next";

import i18n from "@locale";

import type { I18nProviderProps } from "./types";

export function I18nProvider({ locale, children }: I18nProviderProps) {
  if (i18n.resolvedLanguage !== locale) {
    void i18n.changeLanguage(locale);
  }

  return <I18nextProvider i18n={i18n}>{children}</I18nextProvider>;
}
