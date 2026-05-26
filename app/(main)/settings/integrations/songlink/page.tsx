"use client";

import { EnrichmentSingleFieldCard } from "@features/settings/sections/IntegrationsSection/EnrichmentSingleFieldCard";
import { emptyPanel, sectionGrid } from "@features/settings/styles";
import { useSettings } from "@hooks/api/queries/useSettings";

export default function SonglinkIntegrationPage() {
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
      <EnrichmentSingleFieldCard
        initial={data.connections.enrichment}
        field="songlinkApiKey"
        title="Songlink"
        optional
        description="Resolves track URLs from any platform (Spotify, Apple Music, YouTube, etc.) into searchable metadata for cross-platform playlist imports. Without a key, public quota is ~10 req/min."
        fieldLabel="API key"
      />
    </div>
  );
}
