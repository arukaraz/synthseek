"use client";

import { useSettings } from "@hooks/api/queries/useSettings";
import { EnrichmentSingleFieldCard } from "@features/settings/sections/IntegrationsSection/EnrichmentSingleFieldCard";
import { emptyPanel, sectionGrid } from "@features/settings/styles";

export default function AcoustidIntegrationPage() {
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
        field="acoustidApiKey"
        title="AcoustID"
        description="Audio fingerprint lookups for the second-tier metadata import path. Requires fpcalc on the server."
        fieldLabel="API key"
      />
    </div>
  );
}
