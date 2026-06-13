"use client";

import { useUrlParams } from "@hooks/ui/useUrlParam";
import type { UrlParamConfig } from "@hooks/ui/useUrlParam";
import { useCallback, useMemo } from "react";

import { LIBRARY_ALL_FILTER_KEYS, LIBRARY_BASE_PARAMS, LIBRARY_FACET_SEARCH_KEYS, VIEW_CONFIG } from "../constants";
import {
  clampPage,
  isLibraryView,
  parseFilterValues,
  resolveEffectiveDirection,
  resolvePageSize,
  serializeFilterValues,
} from "../helpers";
import type { FacetSearchState, FilterParamMap, LibraryView, SortDirection } from "../types";

function buildSchema() {
  const schema: Record<string, UrlParamConfig> = {
    tab: LIBRARY_BASE_PARAMS.tab,
    q: LIBRARY_BASE_PARAMS.q,
    sort: LIBRARY_BASE_PARAMS.sort,
    dir: LIBRARY_BASE_PARAMS.dir,
    page: LIBRARY_BASE_PARAMS.page,
    rows: LIBRARY_BASE_PARAMS.rows,
  };
  for (const key of LIBRARY_ALL_FILTER_KEYS) schema[key] = { defaultValue: "" };
  for (const key of LIBRARY_FACET_SEARCH_KEYS) schema[`fs_${key}`] = { defaultValue: "" };
  return schema;
}

const SCHEMA = buildSchema();

function isSortDirection(value: string | undefined): value is SortDirection {
  return value === "asc" || value === "desc";
}

export function useLibraryUrlState() {
  const { values, set, setMany } = useUrlParams(SCHEMA);

  const view: LibraryView = isLibraryView(values.tab) ? values.tab : "tracks";
  const config = VIEW_CONFIG[view];

  const sort = values.sort || config.defaultSort;
  const rawDir = isSortDirection(values.dir) ? values.dir : undefined;
  const effectiveDirection = resolveEffectiveDirection(config, sort, rawDir);
  const page = clampPage(values.page ?? "");
  const pageSize = resolvePageSize(values.rows ?? "");

  const filters = useMemo<FilterParamMap>(() => {
    const map: FilterParamMap = {};
    for (const key of config.filterParamKeys) {
      map[key] = parseFilterValues(values[key]);
    }
    return map;
  }, [config.filterParamKeys, values]);

  const facetSearch = useMemo<FacetSearchState>(() => {
    return {
      artist: values.fs_artist || undefined,
      genre: values.fs_genre || undefined,
      playlist: values.fs_playlist || undefined,
      owner: values.fs_owner || undefined,
    };
  }, [values.fs_artist, values.fs_genre, values.fs_playlist, values.fs_owner]);

  const setTab = useCallback(
    (next: LibraryView) => {
      setMany({ tab: next, sort: null, dir: null, page: null });
    },
    [setMany]
  );

  const setSearch = useCallback(
    (next: string) => {
      setMany({ q: next || null, page: null });
    },
    [setMany]
  );

  const setSort = useCallback(
    (next: string) => {
      setMany({ sort: next === config.defaultSort ? null : next, dir: null, page: null });
    },
    [setMany, config.defaultSort]
  );

  const setDir = useCallback(
    (next: SortDirection) => {
      const sortDefault = resolveEffectiveDirection(config, sort, undefined);
      setMany({ dir: next === sortDefault ? null : next, page: null });
    },
    [setMany, config, sort]
  );

  const setPage = useCallback(
    (next: number) => {
      set("page", next <= 1 ? null : String(next));
    },
    [set]
  );

  const setPageSize = useCallback(
    (next: number) => {
      setMany({ rows: String(next), page: null });
    },
    [setMany]
  );

  const setFilterValues = useCallback(
    (key: string, nextValues: string[]) => {
      setMany({ [key]: serializeFilterValues(nextValues), page: null });
    },
    [setMany]
  );

  const setOrphan = useCallback(
    (next: boolean) => {
      setMany({ orphan: next ? "true" : null, page: null });
    },
    [setMany]
  );

  const setFacetSearch = useCallback(
    (key: string, next: string) => {
      set(`fs_${key}`, next || null);
    },
    [set]
  );

  const clearFilters = useCallback(() => {
    const changes: Record<string, string | null> = { page: null };
    for (const key of LIBRARY_ALL_FILTER_KEYS) changes[key] = null;
    for (const key of LIBRARY_FACET_SEARCH_KEYS) changes[`fs_${key}`] = null;
    setMany(changes);
  }, [setMany]);

  return {
    view,
    config,
    search: values.q ?? "",
    sort,
    direction: rawDir,
    effectiveDirection,
    page,
    pageSize,
    filters,
    facetSearch,
    setTab,
    setSearch,
    setSort,
    setDir,
    setPage,
    setPageSize,
    setFilterValues,
    setOrphan,
    setFacetSearch,
    clearFilters,
  };
}

export type LibraryUrlController = ReturnType<typeof useLibraryUrlState>;
