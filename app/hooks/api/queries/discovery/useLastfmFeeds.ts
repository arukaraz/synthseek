import { useMemo } from "react";

import { trpc } from "@utils/trpc";
import type { LastfmCandidate, LastfmFeed, LfmConfig } from "@features/discovery-integrations/types";

import { useDiscoveryConfig } from "./useDiscoveryConfig";

interface UseLastfmFeedsResult {
  isLoading: boolean;
  isError: boolean;
  lfmConfig: LfmConfig | undefined;
  recentScrobbles: LastfmFeed | null;
  topTracks: LastfmFeed | null;
}

interface RawFeedEntry {
  integration: string;
  kind: string;
  result: RawFeedResult;
}

type RawFeedResult =
  | { kind: "ready"; generatedAt: string; candidates: LastfmCandidate[] }
  | { kind: "empty"; generatedAt: string; reason: string }
  | { kind: "failed"; at: string; reason: string };

function projectFeed(entry: RawFeedEntry | undefined): LastfmFeed | null {
  if (!entry) return null;
  const r = entry.result;
  if (r.kind === "ready") {
    return { status: "ready", candidates: r.candidates, generatedAt: r.generatedAt };
  }
  if (r.kind === "empty") {
    return { status: "empty", candidates: [], reason: r.reason, generatedAt: r.generatedAt };
  }
  return { status: "empty", candidates: [], reason: r.reason };
}

export function useLastfmFeeds(): UseLastfmFeedsResult {
  const feedsQuery = trpc.discovery.getAllFeeds.useQuery(undefined, { staleTime: 60_000 });
  const configQuery = useDiscoveryConfig();
  const lfmConfig = configQuery.data?.integrations.lastfm;

  const { recentScrobbles, topTracks } = useMemo(() => {
    const feeds = (feedsQuery.data ?? []) as RawFeedEntry[];
    const recent = feeds.find((f) => f.integration === "lastfm" && f.kind === "recent-tracks");
    const top = feeds.find((f) => f.integration === "lastfm" && f.kind === "top-tracks-overall");
    return {
      recentScrobbles: projectFeed(recent),
      topTracks: projectFeed(top),
    };
  }, [feedsQuery.data]);

  return {
    isLoading: feedsQuery.isLoading || configQuery.isLoading,
    isError: feedsQuery.isError || configQuery.isError,
    lfmConfig,
    recentScrobbles,
    topTracks,
  };
}
