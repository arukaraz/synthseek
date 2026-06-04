"use client";

import { useTranslation } from "react-i18next";

import { SettingsCard } from "../../components/SettingsCard";
import { ApiKeysSubsection } from "./ApiKeysSubsection";
import { McpSubsection } from "./McpSubsection";

export function ApiCard() {
  const { t } = useTranslation("settings");

  return (
    <SettingsCard title={t("api.card.title")} description={t("api.card.description")}>
      <ApiKeysSubsection />
      <McpSubsection />
    </SettingsCard>
  );
}
