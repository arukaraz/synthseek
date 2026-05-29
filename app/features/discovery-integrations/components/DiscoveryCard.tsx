"use client";

import { SettingsCard } from "@features/settings/components/SettingsCard";
import { useDiscoveryConfig } from "@hooks/api/queries/discovery/useDiscoveryConfig";

import { discoveryGrid, discoverySubBoundary } from "../styles";
import type { DiscoveryCardProps } from "../types";
import { LastfmCard } from "./LastfmCard";
import { ListenBrainzCard } from "./ListenBrainzCard";

export function DiscoveryCard({ className }: DiscoveryCardProps) {
  const { data, isLoading, error } = useDiscoveryConfig();

  if (isLoading) {
    return (
      <SettingsCard title="Discovery" className={className}>
        <span className="text-fg/60 text-sm">Loading…</span>
      </SettingsCard>
    );
  }

  if (error || !data) {
    return (
      <SettingsCard title="Discovery" className={className}>
        <span className="text-sm text-red-400">Failed to load discovery config.</span>
      </SettingsCard>
    );
  }

  return (
    <SettingsCard
      title="Discovery"
      optional
      description="Pull recommendations and recent listening feeds from external services. Each can be toggled independently, feeds populate widgets on your Discover page."
      className={className}
    >
      <div className={discoveryGrid()}>
        <div className={discoverySubBoundary()}>
          <ListenBrainzCard config={data.integrations.listenbrainz} />
        </div>
        <div className={discoverySubBoundary()}>
          <LastfmCard config={data.integrations.lastfm} />
        </div>
      </div>
    </SettingsCard>
  );
}
