"use client";

import { useLibraryArtists } from "@hooks/api";
import { LIBRARY_BATCH_LIMIT } from "@hooks/api/queries/library/constants";
import type { LibraryArtistItem } from "@hooks/api/queries/library/types";
import { useEntityPlayback } from "@hooks/ui/useEntityPlayback";
import { useResolveArtistAndOpen } from "@hooks/ui/useResolveArtistAndOpen";
import { useCallback, useMemo } from "react";

import { VIEW_CONFIG } from "../constants";
import { buildArtistsInput, shellCardChrome, shellListsRows } from "../helpers";
import type { LibraryViewModeProps } from "../types";
import { LibraryArtistCard } from "./LibraryCard";
import { LibraryViewLayout } from "./LibraryViewLayout/LibraryViewLayout";

export function ArtistsViewMode({ controller, shell }: LibraryViewModeProps) {
  const openArtistByName = useResolveArtistAndOpen();
  const { shuffleEntity } = useEntityPlayback();
  const chrome = shellCardChrome(shell);
  const asRows = shellListsRows(shell);

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
      <LibraryArtistCard
        item={item}
        resolveEnabled={isArtistsView}
        chrome={chrome}
        variant={asRows ? "row" : "card"}
        onPlay={chrome === "bare" && !asRows ? undefined : () => shuffleEntity({ kind: "artist", artist: item.artist })}
        onOpen={() => openArtistByName(item.artist)}
      />
    ),
    [openArtistByName, isArtistsView, shuffleEntity, chrome, asRows]
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
        letterIndex:
          controller.sort === "name"
            ? {
                entries: query.letterIndex,
                descending: controller.effectiveDirection === "desc",
                loadThrough: query.loadThrough,
              }
            : undefined,
      }}
      shell={shell}
    />
  );
}
