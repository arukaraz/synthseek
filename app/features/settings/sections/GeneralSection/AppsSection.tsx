"use client";

import { useTranslation } from "react-i18next";

import { SettingsPageHeader } from "../../components/SettingsPageHeader";
import { SETTINGS_PAGE_BY_ID } from "../../constants";
import { contentRoot } from "../../styles";
import { ApiKeysCard } from "./ApiKeysCard";
import { McpCard } from "./McpCard";
import { SubsonicCard } from "./SubsonicCard";

export function AppsSection() {
  const { t } = useTranslation("settings");
  const page = SETTINGS_PAGE_BY_ID.apps;

  return (
    <div className={contentRoot()}>
      <SettingsPageHeader title={t(page.labelKey)} description={t(page.descriptionKey)} />
      <SubsonicCard />
      <McpCard />
      <ApiKeysCard />
    </div>
  );
}
