"use client";

import { useSettings } from "@hooks/api/queries/useSettings";
import { EnrichmentSingleFieldCard } from "@features/settings/sections/IntegrationsSection/EnrichmentSingleFieldCard";
import { emptyPanel, sectionGrid } from "@features/settings/styles";

export default function FanartIntegrationPage() {
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
        field="fanartApiKey"
        title="FanART"
        description="Artist images and album fanart from fanart.tv."
        fieldLabel="API key"
      />
    </div>
  );
}
