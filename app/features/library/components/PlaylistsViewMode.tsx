"use client";

import { playlistLibraryTarget } from "@features/content-detail";
import { useContentRequestFlow } from "@features/search/components/ContentRequestFlow";
import { useLibraryPlaylists } from "@hooks/api";
import type { LibraryPlaylistItem } from "@hooks/api/queries/library/types";
import { useEntityPlayback } from "@hooks/ui/useEntityPlayback";
import { playlistOriginLabel } from "@utils/playlist";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";

import { VIEW_CONFIG } from "../constants";
import { buildPlaylistsInput, shellCardChrome, shellListsRows } from "../helpers";
import type { LibraryViewModeProps } from "../types";
import { CardArtwork, LibraryListRow, PlaylistCard, PlaylistCardMenu } from "./LibraryCard";
import { joinMeta, playlistSubtitle } from "./LibraryCard/helpers";
import { LibraryViewLayout } from "./LibraryViewLayout/LibraryViewLayout";

export function PlaylistsViewMode({ controller, shell }: LibraryViewModeProps) {
  const { t } = useTranslation("library");
  const { t: tDetail } = useTranslation("contentDetail");
  const { openForTarget } = useContentRequestFlow();
  const chrome = shellCardChrome(shell);
  const asRows = shellListsRows(shell);
  const { playEntity } = useEntityPlayback();
  const input = useMemo(
    () =>
      buildPlaylistsInput({
        q: controller.search || undefined,
        sort: controller.sort,
        direction: controller.direction,
        filters: controller.filters,
        facetSearch: controller.facetSearch,
      }),
    [controller.search, controller.sort, controller.direction, controller.filters, controller.facetSearch]
  );

  const query = useLibraryPlaylists(input, controller.view === "playlists");

  const renderCard = useCallback(
    (item: LibraryPlaylistItem) => {
      const cover = item.image ?? item.images[0] ?? null;
      const open = () => openForTarget(playlistLibraryTarget({ id: item.id, name: item.name, cover }));

      if (asRows) {
        return (
          <LibraryListRow
            title={item.name}
            subtitle={joinMeta([
              playlistSubtitle(item, playlistOriginLabel(item.origin, t), t),
              t("page.counts.tracks", { count: item.total_tracks }),
            ])}
            openLabel={tDetail("openDetail", { name: item.name })}
            artwork={<CardArtwork src={cover} name={item.name} sizes="56px" />}
            onOpen={open}
            trailing={<PlaylistCardMenu item={item} />}
          />
        );
      }

      return (
        <PlaylistCard
          item={item}
          chrome={chrome}
          onPlay={chrome === "bare" ? undefined : () => playEntity({ kind: "playlist", playlistId: item.id })}
          onOpen={open}
        />
      );
    },
    [openForTarget, playEntity, chrome, asRows, t, tDetail]
  );

  return (
    <LibraryViewLayout
      controller={controller}
      items={query.items}
      total={query.total}
      facets={query.facets}
      isLoading={query.isLoading}
      isError={query.isError}
      content={{
        layout: "grid",
        renderCard,
        getCardId: VIEW_CONFIG.playlists.getCardId,
        hasNextPage: query.hasNextPage,
        isFetchingNextPage: query.isFetchingNextPage,
        fetchNextPage: query.fetchNextPage,
      }}
      shell={shell}
    />
  );
}
