"use client";

import { albumRequestItem } from "@features/content-detail";
import { useContentRequestFlow } from "@features/search/components/ContentRequestFlow";
import { useLibraryAlbums } from "@hooks/api";
import { LIBRARY_BATCH_LIMIT } from "@hooks/api/queries/library/constants";
import { useEntityPlayback } from "@hooks/ui/useEntityPlayback";
import { useRangePreview } from "@hooks/ui/useRangePreview";
import { useCallback, useMemo } from "react";

import { VIEW_CONFIG } from "../constants";
import { applySelectionShortcut, buildAlbumsInput, rangePreviewTone } from "../helpers";
import type { AlbumsViewModeProps } from "../types";
import { AlbumCard, AlbumCardMenu, AlbumSelectionBar } from "./LibraryCard";
import type { LibraryAlbumItem, PlayableTracksTarget } from "@hooks/api/queries/library/types";
import { LibraryViewLayout } from "./LibraryViewLayout/LibraryViewLayout";

export function AlbumsViewMode({
  controller,
  filtersOpen,
  onFiltersOpenChange,
  selection,
  fileActions,
}: AlbumsViewModeProps) {
  const { openForResult } = useContentRequestFlow();
  const { playEntity, enqueueEntity, enqueueEntities } = useEntityPlayback();
  const { previewId, trackRow } = useRangePreview();
  const input = useMemo(
    () =>
      buildAlbumsInput({
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

  const query = useLibraryAlbums(input, controller.view === "albums");

  const items = useMemo(() => query.items ?? [], [query.items]);
  const orderedIds = useMemo(() => items.map((item) => item.id), [items]);
  const preview = previewId ? selection.rangeTo(orderedIds, previewId) : null;
  const previewTone = rangePreviewTone(preview);
  const selecting = selection.selectedCount > 0;
  const showLibraryPaths = (query.facets.libraryPath ?? []).length > 1;

  const enqueueAlbums = useCallback(
    (albums: LibraryAlbumItem[]) =>
      enqueueEntities(
        albums.map((album): PlayableTracksTarget => ({ kind: "album", albumExternalId: album.external_id }))
      ),
    [enqueueEntities]
  );

  const renderCard = useCallback(
    (item: LibraryAlbumItem) => (
      <AlbumCard
        item={item}
        showLibraryPaths={showLibraryPaths}
        onPlay={() => playEntity({ kind: "album", albumExternalId: item.external_id })}
        onOpen={() =>
          openForResult(
            albumRequestItem({
              id: item.external_id,
              name: item.name,
              artistName: item.artist,
              cover: item.album_art,
              genres: item.genres,
            })
          )
        }
        menu={
          <AlbumCardMenu
            item={item}
            onEnqueue={() => void enqueueEntity({ kind: "album", albumExternalId: item.external_id })}
            fileActions={fileActions}
          />
        }
        selection={{
          selected: selection.isSelected(item.id),
          selecting,
          preview: preview?.ids.includes(item.id) ? previewTone : "none",
          onToggle: (extend) => (extend ? selection.extendTo(orderedIds, item.id) : selection.toggle(item.id)),
          onHover: (hovered) => trackRow(hovered ? item.id : null),
        }}
      />
    ),
    [
      openForResult,
      playEntity,
      enqueueEntity,
      fileActions,
      selection,
      selecting,
      preview,
      previewTone,
      orderedIds,
      trackRow,
      showLibraryPaths,
    ]
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
        getCardId: VIEW_CONFIG.albums.getCardId,
        hasNextPage: query.hasNextPage,
        isFetchingNextPage: query.isFetchingNextPage,
        fetchNextPage: query.fetchNextPage,
        bulkBar: (
          <AlbumSelectionBar items={items} selection={selection} fileActions={fileActions} onEnqueue={enqueueAlbums} />
        ),
        onKeyDown: (event) => {
          applySelectionShortcut(event, selection, orderedIds);
        },
      }}
      filtersOpen={filtersOpen}
      onFiltersOpenChange={onFiltersOpenChange}
    />
  );
}
