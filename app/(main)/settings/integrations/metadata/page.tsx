"use client";

import { ArtworkCard } from "@features/settings/sections/IntegrationsSection/ArtworkCard";
import { EnrichmentSingleFieldCard } from "@features/settings/sections/IntegrationsSection/EnrichmentSingleFieldCard";
import { emptyPanel, sectionGrid } from "@features/settings/styles";
import { useSettings } from "@hooks/api/queries/useSettings";

export default function MetadataIntegrationPage() {
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
      <ArtworkCard initial={data.connections.enrichment} />
      <EnrichmentSingleFieldCard
        initial={data.connections.enrichment}
        field="acoustidApiKey"
        title="AcoustID"
        optional
        description="Fallback track identification."
        fieldLabel="API key"
      />
    </div>
  );
}
