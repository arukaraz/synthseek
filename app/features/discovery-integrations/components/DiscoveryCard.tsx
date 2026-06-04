"use client";

import { SettingsCard } from "@features/settings/components/SettingsCard";
import { useDiscoveryConfig } from "@hooks/api/queries/discovery/useDiscoveryConfig";
import { useTranslation } from "react-i18next";

import { discoveryGrid, discoverySubBoundary } from "../styles";
import type { DiscoveryCardProps } from "../types";
import { LastfmCard } from "./LastfmCard";
import { ListenBrainzCard } from "./ListenBrainzCard";

export function DiscoveryCard({ className }: DiscoveryCardProps) {
  const { t } = useTranslation("library");
  const { data, isLoading, error } = useDiscoveryConfig();

  if (isLoading) {
    return (
      <SettingsCard title={t("discoveryIntegrations.card.title")} className={className}>
        <span className="text-fg/60 text-sm">{t("discoveryIntegrations.card.loading")}</span>
      </SettingsCard>
    );
  }

  if (error || !data) {
    return (
      <SettingsCard title={t("discoveryIntegrations.card.title")} className={className}>
        <span className="text-sm text-red-400">{t("discoveryIntegrations.card.loadError")}</span>
      </SettingsCard>
    );
  }

  return (
    <SettingsCard
      title={t("discoveryIntegrations.card.title")}
      optional
      description={t("discoveryIntegrations.card.description")}
      className={className}
    >
      <div className={discoveryGrid()}>
        <div className={discoverySubBoundary()}>
          <ListenBrainzCard config={data.integrations.listenbrainz} />
        </div>
        <div className={discoverySubBoundary()}>
          <LastfmCard config={data.integrations.lastfm} />
        </div>
      </div>
    </SettingsCard>
  );
}
