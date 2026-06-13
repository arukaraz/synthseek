"use client";

import { useLibraryArtists } from "@hooks/api";
import { LIBRARY_BATCH_LIMIT } from "@hooks/api/queries/library/constants";
import { useMemo } from "react";

import { VIEW_CONFIG } from "../constants";
import { buildArtistsInput } from "../helpers";
import type { LibraryViewModeProps } from "../types";
import { LibraryViewLayout } from "./LibraryViewLayout/LibraryViewLayout";

export function ArtistsViewMode({ controller, filtersOpen, onFiltersOpenChange }: LibraryViewModeProps) {
  const input = useMemo(
    () =>
      buildArtistsInput({
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

  const query = useLibraryArtists(input, controller.view === "artists");

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
        renderCard: VIEW_CONFIG.artists.renderCard,
        getCardId: VIEW_CONFIG.artists.getCardId,
        hasNextPage: query.hasNextPage,
        isFetchingNextPage: query.isFetchingNextPage,
        fetchNextPage: query.fetchNextPage,
      }}
      filtersOpen={filtersOpen}
      onFiltersOpenChange={onFiltersOpenChange}
    />
  );
}
