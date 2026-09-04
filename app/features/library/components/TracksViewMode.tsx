"use client";

import { useLibraryTracks, useLibraryTracksPrefetch } from "@hooks/api";
import { useEffect, useMemo } from "react";

import { useLibraryPlayback } from "../hooks/useLibraryPlayback";
import { buildTracksInput } from "../helpers";
import { buildTrackColumns } from "./LibraryTable/columns";
import type { TracksViewModeProps } from "../types";
import { LibraryViewLayout } from "./LibraryViewLayout/LibraryViewLayout";

export function TracksViewMode({ controller, filtersOpen, onFiltersOpenChange, selection }: TracksViewModeProps) {
  const { prefetchNextPage } = useLibraryTracksPrefetch();
  const offset = (controller.page - 1) * controller.pageSize;

  const input = useMemo(
    () =>
      buildTracksInput({
        limit: controller.pageSize,
        offset,
        q: controller.search || undefined,
        sort: controller.sort,
        direction: controller.direction,
        filters: controller.filters,
        facetSearch: controller.facetSearch,
      }),
    [
      controller.pageSize,
      offset,
      controller.search,
      controller.sort,
      controller.direction,
      controller.filters,
      controller.facetSearch,
    ]
  );

  const query = useLibraryTracks(input, controller.view === "tracks");

  const items = useMemo(() => query.data?.items ?? [], [query.data?.items]);
  const { play } = useLibraryPlayback(items);
  const columns = useMemo(() => buildTrackColumns({ onPlay: play }), [play]);

  const total = query.data?.total ?? 0;
  const hasNextPage = offset + controller.pageSize < total;

  useEffect(() => {
    if (!hasNextPage) return;
    prefetchNextPage(input, offset + controller.pageSize);
  }, [prefetchNextPage, input, offset, controller.pageSize, hasNextPage]);

  return (
    <LibraryViewLayout
      controller={controller}
      items={query.data?.items}
      total={total}
      facets={query.data?.facets ?? {}}
      isLoading={query.isLoading}
      isError={query.isError}
      content={{
        layout: "table",
        columns,
        getRowId: (item) => item.id,
        selection: { items, selection },
      }}
      filtersOpen={filtersOpen}
      onFiltersOpenChange={onFiltersOpenChange}
    />
  );
}
