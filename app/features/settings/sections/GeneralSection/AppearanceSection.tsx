"use client";

import { useTranslation } from "react-i18next";

import { SettingsPageHeader } from "../../components/SettingsPageHeader";
import { SETTINGS_PAGE_BY_ID } from "../../constants";
import { contentRoot } from "../../styles";
import { LanguageCard } from "./LanguageCard";
import { ThemeCard } from "./ThemeCard";

export function AppearanceSection() {
  const { t } = useTranslation("settings");
  const page = SETTINGS_PAGE_BY_ID.appearance;

  return (
    <div className={contentRoot()}>
      <SettingsPageHeader title={t(page.labelKey)} description={t(page.descriptionKey)} />
      <ThemeCard />
      <LanguageCard />
    </div>
  );
}
