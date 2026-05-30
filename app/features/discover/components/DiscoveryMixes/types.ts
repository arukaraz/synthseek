import type { inferRouterOutputs } from "@trpc/server";
import type { LucideIcon } from "lucide-react";

import type { AppRouter } from "@api/__generated__/types";
import type { LbPlaylistKind } from "@features/discovery-integrations/types";

type RouterOutputs = inferRouterOutputs<AppRouter>;
type FeedEntry = RouterOutputs["discovery"]["getAllFeeds"][number];

export type FeedResult = FeedEntry["result"];
export type FeedCandidate = Extract<FeedResult, { kind: "ready" }>["candidates"][number];

export type MixAccent = "daily" | "weekly" | "explore" | "cf";

export type MixStatus = "ready" | "empty" | "none";

interface DiscoveryMixBase {
  kind: LbPlaylistKind;
  candidates: FeedCandidate[];
  generatedAt?: string;
  emptyReason?: string;
}

export type ReadyMix = DiscoveryMixBase & { status: "ready" };
export type EmptyMix = DiscoveryMixBase & { status: "empty" | "none" };
export type DiscoveryMix = ReadyMix | EmptyMix;

export interface LbKindMeta {
  label: string;
  tag: string;
  blurb: string;
  icon: LucideIcon;
  acc: MixAccent;
}

export interface DiscoveryMixCardProps {
  mix: ReadyMix;
  onClick: () => void;
}

export interface DiscoveryMixCardEmptyProps {
  mix: EmptyMix;
}

export interface DiscoveryMixMosaicProps {
  candidates: FeedCandidate[];
  fallbackSeed: string;
}

export type DiscoveryMixesEmptyReason = "error" | "disabled" | "no-username" | "no-kinds";

export interface DiscoveryMixesEmptyProps {
  reason: DiscoveryMixesEmptyReason;
}
