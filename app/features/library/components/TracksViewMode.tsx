"use client";

import { useLibraryTracks } from "@hooks/api";
import { useMemo } from "react";

import { useLibraryPlayback } from "../hooks/useLibraryPlayback";
import { useLibraryTrackActions } from "../hooks/useLibraryTrackActions";
import { buildTracksInput } from "../helpers";
import { buildTrackColumns } from "./LibraryTable/columns";
import type { TracksViewModeProps } from "../types";
import { LibraryTrackRows } from "./LibraryTrackRows";
import { LibraryViewLayout } from "./LibraryViewLayout/LibraryViewLayout";

export function TracksViewMode({ controller, shell, selection, fileActions }: TracksViewModeProps) {
  const { searchBetterQuality } = useLibraryTrackActions();

  const input = useMemo(
    () =>
      buildTracksInput({
        q: controller.search || undefined,
        sort: controller.sort,
        direction: controller.direction,
        filters: controller.filters,
        facetSearch: controller.facetSearch,
      }),
    [controller.search, controller.sort, controller.direction, controller.filters, controller.facetSearch]
  );

  const query = useLibraryTracks(input, controller.view === "tracks");

  const items = useMemo(() => query.items ?? [], [query.items]);
  const { play, enqueue } = useLibraryPlayback(items, query.appliedSources);
  const showLibraryPath = (query.facets.libraryPath ?? []).length > 1;
  const columns = useMemo(
    () =>
      buildTrackColumns({
        onPlay: play,
        onEnqueue: enqueue,
        onSearchBetterQuality: searchBetterQuality,
        fileActions,
        showLibraryPath,
      }),
    [play, enqueue, searchBetterQuality, fileActions, showLibraryPath]
  );

  return (
    <LibraryViewLayout
      controller={controller}
      items={query.items}
      total={query.total}
      facets={query.facets}
      isLoading={query.isLoading}
      isError={query.isError}
      isRefreshing={query.isRefreshing}
      content={{
        layout: "table",
        columns,
        getRowId: (item) => item.id,
        hasNextPage: query.hasNextPage,
        isFetchingNextPage: query.isFetchingNextPage,
        fetchNextPage: query.fetchNextPage,
        selection: {
          items,
          selection,
          onEnqueue: enqueue,
          fileActions,
          collapsed: shell.phone && !shell.selectMode,
        },
        rows: shell.phone ? (
          <LibraryTrackRows
            items={items}
            selection={selection}
            selecting={shell.selectMode}
            onHold={
              shell.selectMode
                ? undefined
                : (trackId) => {
                    shell.onSelectModeChange(true);
                    selection.toggle(trackId);
                  }
            }
            onPlay={play}
            onEnqueue={enqueue}
            onSearchBetterQuality={searchBetterQuality}
            fileActions={fileActions}
          />
        ) : undefined,
      }}
      shell={shell}
    />
  );
}
