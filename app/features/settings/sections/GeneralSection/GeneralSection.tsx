"use client";

import { useTranslation } from "react-i18next";

import { SettingsPageHeader } from "../../components/SettingsPageHeader";
import { contentRoot } from "../../styles";
import { ConnectAppsCard } from "./ConnectAppsCard";
import { LanguageCard } from "./LanguageCard";
import { LoudnessCard } from "./LoudnessCard";
import { ThemeCard } from "./ThemeCard";

export function GeneralSection() {
  const { t } = useTranslation("settings");
  return (
    <div className={contentRoot()}>
      <SettingsPageHeader title={t("general.pageTitle")} />
      <ThemeCard />
      <LanguageCard />
      <LoudnessCard />
      <ConnectAppsCard />
    </div>
  );
}
