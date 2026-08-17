"use client";

import type { FlatTrackRow } from "@features/requests/types";
import { useRecentTracks } from "@hooks/api";

const RECENT_REQUESTS_LIMIT = 15;

interface UseRecentRequestsResult {
  recent: FlatTrackRow[];
  isLoading: boolean;
  isError: boolean;
  limit: number;
}

export function useRecentRequests(): UseRecentRequestsResult {
  const { data, isLoading, isError } = useRecentTracks(RECENT_REQUESTS_LIMIT);

  return { recent: data ?? [], isLoading, isError, limit: RECENT_REQUESTS_LIMIT };
}
