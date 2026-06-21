"use client";

import { flattenRequestsToTrackRows } from "@features/requests/helpers";
import type { FlatTrackRow } from "@features/requests/types";
import { useTrackRequests } from "@hooks/api";
import { useMemo } from "react";

const RECENT_REQUESTS_LIMIT = 15;

interface UseRecentRequestsResult {
  recent: FlatTrackRow[];
  isLoading: boolean;
  isError: boolean;
  limit: number;
}

export function useRecentRequests(): UseRecentRequestsResult {
  const { data: items, isLoading, isError } = useTrackRequests();

  const recent = useMemo<FlatTrackRow[]>(() => {
    if (!items) return [];

    const sorted = flattenRequestsToTrackRows(items).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    const byTrackId = new Map<string, FlatTrackRow>();
    for (const row of sorted) {
      if (!byTrackId.has(row.id)) byTrackId.set(row.id, row);
    }

    return Array.from(byTrackId.values()).slice(0, RECENT_REQUESTS_LIMIT);
  }, [items]);

  return { recent, isLoading, isError, limit: RECENT_REQUESTS_LIMIT };
}
