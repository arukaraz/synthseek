"use client";

import { useLibraryPlaylists } from "@hooks/api";
import { LIBRARY_BATCH_LIMIT } from "@hooks/api/queries/library/constants";
import { useMemo } from "react";

import { VIEW_CONFIG } from "../constants";
import { buildPlaylistsInput } from "../helpers";
import type { LibraryViewModeProps } from "../types";
import { LibraryViewLayout } from "./LibraryViewLayout/LibraryViewLayout";

export function PlaylistsViewMode({ controller, filtersOpen, onFiltersOpenChange }: LibraryViewModeProps) {
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
        renderCard: VIEW_CONFIG.playlists.renderCard,
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
