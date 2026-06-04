"use client";

import { useTranslation } from "react-i18next";

import { SettingsPageHeader } from "../../components/SettingsPageHeader";
import { contentRoot } from "../../styles";
import { ApiCard } from "./ApiCard";
import { LanguageCard } from "./LanguageCard";
import { ThemeCard } from "./ThemeCard";

export function GeneralSection() {
  const { t } = useTranslation("settings");
  return (
    <div className={contentRoot()}>
      <SettingsPageHeader title={t("general.pageTitle")} />
      <ThemeCard />
      <LanguageCard />
      <ApiCard />
    </div>
  );
}
