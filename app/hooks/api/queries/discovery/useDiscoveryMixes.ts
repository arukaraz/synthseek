import { useMemo } from "react";

import { trpc } from "@utils/trpc";
import type { LbConfig, LbPlaylistKind } from "@features/discovery-integrations/types";
import type { DiscoveryMix } from "@features/discover/components/DiscoveryMixes/types";

import { useDiscoveryConfig } from "./useDiscoveryConfig";

interface UseDiscoveryMixesResult {
  isLoading: boolean;
  isError: boolean;
  lbConfig: LbConfig | undefined;
  mixes: DiscoveryMix[];
}

export function useDiscoveryMixes(): UseDiscoveryMixesResult {
  const feedsQuery = trpc.discovery.getAllFeeds.useQuery(undefined, { staleTime: 60_000 });
  const configQuery = useDiscoveryConfig();

  const lbConfig = configQuery.data?.integrations.listenbrainz;

  const mixes = useMemo<DiscoveryMix[]>(() => {
    if (!lbConfig) return [];
    const feeds = feedsQuery.data ?? [];
    const selectedKinds: LbPlaylistKind[] = lbConfig.selectedKinds;
    return selectedKinds.map((kind): DiscoveryMix => {
      const entry = feeds.find((feed) => feed.integration === "listenbrainz" && feed.kind === kind);
      if (!entry) return { kind, status: "none", candidates: [] };

      const result = entry.result;
      if (result.kind === "ready") {
        if (result.candidates.length === 0) {
          return { kind, status: "empty", candidates: [], emptyReason: "no-resolved", generatedAt: result.generatedAt };
        }
        return { kind, status: "ready", candidates: result.candidates, generatedAt: result.generatedAt };
      }
      if (result.kind === "empty") {
        return { kind, status: "empty", candidates: [], emptyReason: result.reason, generatedAt: result.generatedAt };
      }
      return { kind, status: "empty", candidates: [], emptyReason: result.reason };
    });
  }, [lbConfig, feedsQuery.data]);

  return {
    isLoading: feedsQuery.isLoading || configQuery.isLoading,
    isError: feedsQuery.isError || configQuery.isError,
    lbConfig,
    mixes,
  };
}
