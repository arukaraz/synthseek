"use client";

import { useSettings } from "@hooks/api/queries/useSettings";
import { EnrichmentSingleFieldCard } from "@features/settings/sections/IntegrationsSection/EnrichmentSingleFieldCard";
import { emptyPanel, sectionGrid } from "@features/settings/styles";

export default function MusicBrainzIntegrationPage() {
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
        field="musicbrainzEmail"
        title="MusicBrainz"
        description="Contact email required by MusicBrainz API policy. Used for ISRC + metadata lookups during import."
        fieldLabel="Contact email"
        inputType="email"
        placeholder="you@example.com"
      />
    </div>
  );
}
