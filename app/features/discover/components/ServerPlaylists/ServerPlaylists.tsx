"use client";

import { MonitorPlay } from "lucide-react";
import { useTranslation } from "react-i18next";

import { WidgetFrame } from "@components/WidgetFrame";
import { playlistLibraryTarget } from "@features/content-detail";
import { useContentRequestFlow } from "@features/search/components/ContentRequestFlow";
import { useServerPlaylists } from "@hooks/api/queries/analytics/useServerPlaylists";
import { usePlaylistSyncTargets } from "@hooks/api/queries/usePlaylistSyncTargets";
import { formatRelativeTime } from "@utils/formatters";

import type { BoardWidgetProps } from "../ExploreBoard/types";
import { widgetPill } from "../styles";
import { widgetList } from "../WidgetRow/styles";
import { WidgetRow } from "../WidgetRow/WidgetRow";

export function ServerPlaylists({ info }: BoardWidgetProps) {
  const { t } = useTranslation("discover");
  const playlists = useServerPlaylists();
  const targets = usePlaylistSyncTargets();
  const { openForTarget } = useContentRequestFlow();
  const rows = playlists.data ?? [];
  const servers = targets.data ?? [];
  const failed = playlists.isError || targets.isError;

  return (
    <WidgetFrame
      icon={MonitorPlay}
      title={t("serverPlaylists.title")}
      subtitle={t("serverPlaylists.subtitle")}
      info={info}
      titleId="server-playlists-heading"
      loading={playlists.isLoading || targets.isLoading}
      note={
        failed
          ? t("history.error")
          : servers.length === 0
            ? t("serverPlaylists.noServers")
            : rows.length === 0
              ? t("serverPlaylists.empty")
              : null
      }
    >
      <ul className={widgetList()}>
        {rows.map((playlist) => (
          <WidgetRow
            key={playlist.id}
            cover={playlist.cover}
            seed={playlist.id}
            title={playlist.name}
            subtitle={t("serverPlaylists.tracks", { count: playlist.tracks })}
            trailing={servers.map((target) => {
              const link = playlist.links.find((entry) => entry.server === target.server);
              const state = link
                ? t("serverPlaylists.synced", { when: formatRelativeTime(link.syncedAt) })
                : t("serverPlaylists.notSynced");
              return (
                <span key={target.server} className={widgetPill({ tone: link ? "success" : "muted" })} title={state}>
                  {target.name}
                  <span className="sr-only">{state}</span>
                </span>
              );
            })}
            onSelect={() =>
              openForTarget(playlistLibraryTarget({ id: playlist.id, name: playlist.name, cover: playlist.cover }))
            }
          />
        ))}
      </ul>
    </WidgetFrame>
  );
}
