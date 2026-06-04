"use client";

import { useTranslation } from "react-i18next";

import { useSetLanguage } from "@hooks/api/mutations/auth/useSetLanguage";
import { DEFAULT_LOCALE, isLocale } from "@locale/config";
import { trpc } from "@utils/trpc";

import { SettingsCard } from "../../components/SettingsCard";
import { LanguageSelector } from "./LanguageSelector";

export function LanguageCard() {
  const { t } = useTranslation("settings");
  const { data: me } = trpc.auth.me.useQuery();
  const setLanguage = useSetLanguage();

  const value = me && isLocale(me.language) ? me.language : DEFAULT_LOCALE;

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
