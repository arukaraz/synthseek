"use client";

import { useTranslation } from "react-i18next";

import { useSetLanguage } from "@hooks/api/mutations/auth/useSetLanguage";
import { DEFAULT_LOCALE, isLocale } from "@locale/config";
import { useAuthContext } from "@modules/providers/AuthProvider";

import { SettingsCard } from "../../components/SettingsCard";
import { LanguageSelector } from "./LanguageSelector";

export function LanguageCard() {
  const { t } = useTranslation("settings");
  const { currentUser } = useAuthContext();
  const setLanguage = useSetLanguage();

  const value = currentUser && isLocale(currentUser.language) ? currentUser.language : DEFAULT_LOCALE;

  return (
    <SettingsCard title={t("general.language.title")} description={t("general.language.description")}>
      <LanguageSelector
        value={value}
        ariaLabel={t("general.language.selectorLabel")}
        onSelect={(locale) => setLanguage.mutate({ language: locale })}
      />
    </SettingsCard>
  );
}
