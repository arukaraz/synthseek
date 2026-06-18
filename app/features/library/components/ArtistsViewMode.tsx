"use client";

import { useLibraryArtists } from "@hooks/api";
import { LIBRARY_BATCH_LIMIT } from "@hooks/api/queries/library/constants";
import type { LibraryArtistItem } from "@hooks/api/queries/library/types";
import { useResolveArtistAndOpen } from "@hooks/ui/useResolveArtistAndOpen";
import { useCallback, useMemo } from "react";

import { VIEW_CONFIG } from "../constants";
import { buildArtistsInput } from "../helpers";
import type { LibraryViewModeProps } from "../types";
import { LibraryArtistCard } from "./LibraryCard";
import { LibraryViewLayout } from "./LibraryViewLayout/LibraryViewLayout";

export function ArtistsViewMode({ controller, filtersOpen, onFiltersOpenChange }: LibraryViewModeProps) {
  const openArtistByName = useResolveArtistAndOpen();

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

  const isArtistsView = controller.view === "artists";
  const query = useLibraryArtists(input, isArtistsView);

  const renderCard = useCallback(
    (item: LibraryArtistItem) => (
      <LibraryArtistCard item={item} resolveEnabled={isArtistsView} onOpen={() => openArtistByName(item.artist)} />
    ),
    [openArtistByName, isArtistsView]
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
