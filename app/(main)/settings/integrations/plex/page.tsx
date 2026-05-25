"use client";

import { useSettings } from "@hooks/api/queries/useSettings";
import { PlexIntegrationCard } from "@features/settings/sections/IntegrationsSection/PlexIntegrationCard";
import { emptyPanel, sectionGrid } from "@features/settings/styles";

export default function PlexIntegrationPage() {
  const { data, isLoading, error } = useSettings();

  if (isLoading)
    return (
      <div className={emptyPanel()}>
        <span className="text-fg/60 text-sm">Loading…</span>
      </div>
    );

  if (error || !data)
    return (
      <div className={emptyPanel()}>
        <span className="text-sm text-red-400">Failed to load settings.</span>
      </div>
    );

  return (
    <div className={sectionGrid()}>
      <PlexIntegrationCard
        initial={{
          connection: data.connections.plex,
          behavior: data.engine.plexBehavior,
          naming: data.formatting,
        }}
      />
    </div>
  );
}
