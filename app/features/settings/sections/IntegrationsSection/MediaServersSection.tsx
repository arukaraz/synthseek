"use client";

import { useTranslation } from "react-i18next";

import { useSettings } from "@hooks/api/queries/useSettings";

import { emptyPanel, sectionGrid } from "../../styles";
import { JellyfinCard } from "./JellyfinCard";
import { NavidromeCard } from "./NavidromeCard";
import { PlaybackOrderCard } from "./PlaybackOrderCard";
import { PlexIntegrationCard } from "./PlexIntegrationCard";

export function MediaServersSection() {
  const { t } = useTranslation("settings");
  const { data, isLoading, error } = useSettings();

  if (isLoading) {
    return (
      <div className={emptyPanel()}>
        <span className="text-fg/60 text-sm">{t("common.loading")}</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={emptyPanel()}>
        <span className="text-destructive-vivid text-sm">{t("common.loadFailed")}</span>
      </div>
    );
  }

  const { plex, navidrome, jellyfin } = data.connections;
  const connected = {
    plex: Boolean(plex.url && plex.token),
    navidrome: Boolean(navidrome.url && navidrome.username && navidrome.password),
    jellyfin: Boolean(jellyfin.url && jellyfin.apiKey),
  };

  return (
    <div className={sectionGrid()}>
      <NavidromeCard initial={navidrome} />
      <JellyfinCard initial={jellyfin} />
      <PlexIntegrationCard
        initial={{ connection: plex, behavior: data.engine.plexBehavior, naming: data.formatting }}
      />
      <PlaybackOrderCard order={data.engine.playbackSources.order} connected={connected} />
    </div>
  );
}
