"use client";

import { useTranslation } from "react-i18next";

import { SettingsPageHeader } from "../../components/SettingsPageHeader";
import { SETTINGS_PAGE_BY_ID } from "../../constants";
import { contentRoot } from "../../styles";
import { ListeningServicesCard } from "./components/ListeningServicesCard";
import { NeverIncludeCard } from "./components/NeverIncludeCard";

export function ListeningSection() {
  const { t } = useTranslation("settings");
  const page = SETTINGS_PAGE_BY_ID.listening;

  return (
    <div className={contentRoot()}>
      <SettingsPageHeader title={t(page.labelKey)} description={t(page.descriptionKey)} />
      <ListeningServicesCard />
      <NeverIncludeCard />
    </div>
  );
}
