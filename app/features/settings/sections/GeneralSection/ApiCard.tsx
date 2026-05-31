"use client";

import { SettingsCard } from "../../components/SettingsCard";
import { ApiKeysSubsection } from "./ApiKeysSubsection";
import { API_CARD } from "./constants";
import { McpSubsection } from "./McpSubsection";

export function ApiCard() {
  return (
    <SettingsCard title={API_CARD.title} description={API_CARD.description}>
      <ApiKeysSubsection />
      <McpSubsection />
    </SettingsCard>
  );
}
