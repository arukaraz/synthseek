"use client";

import { BottomNav } from "@components/BottomNav";
import { ContentShell } from "@components/ContentShell";
import { PlaybackSourcePicker } from "@components/Player";
import { PlayerDock } from "@components/PlayerDock";
import { ProgressDock } from "@components/ui/ProgressDock";
import { SystemStatusBanner } from "@components/SystemStatusBanner";
import { TopHeader } from "@components/TopHeader";
import type { FilterType } from "@api/__generated__/types";
import { ContentRequestFlow } from "@features/search/components/ContentRequestFlow";
import { getActiveFilter } from "@features/search/components/SearchResultsWidget/helpers";
import {
  useRehydratePlaylistSyncDock,
  useRehydrateRequestDock,
  useReviewApprovalDock,
  useSubscriptions,
} from "@hooks/api/subscriptions";
import { useHashTargetGlow } from "@hooks/ui/useHashTargetGlow";
import { useRouter, useSearchParams } from "next/navigation";

import { searchHref } from "./helpers";
import type { MainLayoutContentProps } from "./types";

export function MainLayoutContent({ children }: MainLayoutContentProps) {
  useSubscriptions();
  useRehydrateRequestDock();
  useRehydratePlaylistSyncDock();
  useReviewApprovalDock();
  useHashTargetGlow();

  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("q") ?? "";
  const searchScope = getActiveFilter(searchParams.get("filter"), "all");

  const handleSearch = (query: string, scope: FilterType) => {
    router.push(searchHref(query, scope));
  };

  return (
    <div className="bg-surface min-h-screen overflow-hidden">
      <ContentRequestFlow>
        <TopHeader onSearch={handleSearch} initialQuery={searchQuery} initialScope={searchScope} />
        <ContentShell banner={<SystemStatusBanner />}>{children}</ContentShell>
      </ContentRequestFlow>
      <BottomNav />
      <ProgressDock />
      <PlayerDock />
      <PlaybackSourcePicker />
    </div>
  );
}
