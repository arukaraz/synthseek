"use client";

import { useTranslation } from "react-i18next";

import { useSettings } from "@hooks/api/queries/useSettings";

import { emptyPanel, sectionGrid } from "../../styles";
import { JellyfinCard } from "./JellyfinCard";
import { NavidromeCard } from "./NavidromeCard";
import { PlaybackOrderCard } from "./PlaybackOrderCard";

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

  const playing = {
    plex: data.engine.plexBehavior.playback && Boolean(data.connections.plex.url && data.connections.plex.token),
    navidrome: data.connections.navidrome.playback && Boolean(data.connections.navidrome.url),
    jellyfin: data.connections.jellyfin.playback && Boolean(data.connections.jellyfin.url),
  };

  return (
    <div className={sectionGrid()}>
      <NavidromeCard initial={data.connections.navidrome} />
      <JellyfinCard initial={data.connections.jellyfin} />
      <PlaybackOrderCard order={data.engine.playbackSources.order} playing={playing} />
    </div>
  );
}
