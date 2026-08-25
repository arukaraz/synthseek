"use client";

import { useTranslation } from "react-i18next";

import { SettingsCard } from "../../components/SettingsCard";
import { ApiKeysSubsection } from "./ApiKeysSubsection";
import { McpSubsection } from "./McpSubsection";
import { SubsonicSubsection } from "./SubsonicSubsection";

export function ConnectAppsCard() {
  const { t } = useTranslation("settings");

  return (
    <SettingsCard title={t("connectApps.card.title")} description={t("connectApps.card.description")}>
      <SubsonicSubsection />
      <McpSubsection />
      <ApiKeysSubsection />
    </SettingsCard>
  );
}
