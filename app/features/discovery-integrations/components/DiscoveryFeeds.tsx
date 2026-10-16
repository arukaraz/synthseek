"use client";

import { useTranslation } from "react-i18next";

import { useDiscoveryConfig } from "@hooks/api/queries/discovery/useDiscoveryConfig";

import { feedPanel, feedPanelStatus } from "../styles";
import type { DiscoveryFeedsProps } from "../types";
import { LastfmCard } from "./LastfmCard";
import { ListenBrainzCard } from "./ListenBrainzCard";

export function DiscoveryFeeds({ service, apiKeyConfigured }: DiscoveryFeedsProps) {
  const { t } = useTranslation("library");
  const { data, isLoading, error } = useDiscoveryConfig();

  if (isLoading || error || !data) {
    return (
      <div className={feedPanel()}>
        <span className={feedPanelStatus({ failed: !isLoading })}>
          {isLoading ? t("discoveryIntegrations.card.loading") : t("discoveryIntegrations.card.loadError")}
        </span>
      </div>
    );
  }

  return service === "lastfm" ? (
    <LastfmCard config={data.integrations.lastfm} apiKeyConfigured={apiKeyConfigured} />
  ) : (
    <ListenBrainzCard config={data.integrations.listenbrainz} />
  );
}
