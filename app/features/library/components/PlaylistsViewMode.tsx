"use client";

import { playlistLibraryTarget } from "@features/content-detail";
import { useContentRequestFlow } from "@features/search/components/ContentRequestFlow";
import { useLibraryPlaylists } from "@hooks/api";
import { LIBRARY_BATCH_LIMIT } from "@hooks/api/queries/library/constants";
import type { LibraryPlaylistItem } from "@hooks/api/queries/library/types";
import { useCallback, useMemo } from "react";

import { VIEW_CONFIG } from "../constants";
import { buildPlaylistsInput } from "../helpers";
import type { LibraryViewModeProps } from "../types";
import { PlaylistCard } from "./LibraryCard";
import { LibraryViewLayout } from "./LibraryViewLayout/LibraryViewLayout";

export function PlaylistsViewMode({ controller, filtersOpen, onFiltersOpenChange }: LibraryViewModeProps) {
  const { openForTarget } = useContentRequestFlow();
  const input = useMemo(
    () =>
      buildPlaylistsInput({
        limit: LIBRARY_BATCH_LIMIT,
        offset: 0,
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
    (item: LibraryPlaylistItem) => (
      <PlaylistCard
        item={item}
        onOpen={() =>
          openForTarget(
            playlistLibraryTarget({
              id: item.id,
              name: item.name,
              cover: item.image ?? item.images[0] ?? null,
            })
          )
        }
      />
    ),
    [openForTarget]
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
      filtersOpen={filtersOpen}
      onFiltersOpenChange={onFiltersOpenChange}
    />
  );
}
