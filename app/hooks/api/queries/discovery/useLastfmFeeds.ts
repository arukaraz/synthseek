import { useMemo } from "react";

import { trpc } from "@utils/trpc";
import type {
  LastfmScrobblesFeed,
  LastfmTopTracksFeed,
  LastfmTrack,
  LfmConfig,
} from "@features/discovery-integrations/types";

import { useDiscoveryConfig } from "./useDiscoveryConfig";

interface UseLastfmFeedsResult {
  isLoading: boolean;
  isError: boolean;
  lfmConfig: LfmConfig | undefined;
  recentScrobbles: LastfmScrobblesFeed | null;
  topTracks: LastfmTopTracksFeed | null;
}

interface RawFeedEntry {
  integration: string;
  kind: string;
  result: RawFeedResult;
}

type RawFeedResult =
  | { kind: "ready"; generatedAt: string; candidates: LastfmTrack[] }
  | { kind: "empty"; generatedAt: string; reason: string }
  | { kind: "failed"; at: string; reason: string };

function projectScrobblesFeed(entry: RawFeedEntry | undefined): LastfmScrobblesFeed | null {
  if (!entry) return null;
  const r = entry.result;
  if (r.kind === "ready") {
    return { status: "ready", scrobbles: r.candidates, generatedAt: r.generatedAt };
  }
  if (r.kind === "empty") {
    return { status: "empty", scrobbles: [], reason: r.reason, generatedAt: r.generatedAt };
  }
  return { status: "empty", scrobbles: [], reason: r.reason };
}

function projectTopTracksFeed(entry: RawFeedEntry | undefined): LastfmTopTracksFeed | null {
  if (!entry) return null;
  const r = entry.result;
  if (r.kind === "ready") {
    return { status: "ready", tracks: r.candidates, generatedAt: r.generatedAt };
  }
  if (r.kind === "empty") {
    return { status: "empty", tracks: [], reason: r.reason, generatedAt: r.generatedAt };
  }
  return { status: "empty", tracks: [], reason: r.reason };
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
      recentScrobbles: projectScrobblesFeed(recent),
      topTracks: projectTopTracksFeed(top),
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
