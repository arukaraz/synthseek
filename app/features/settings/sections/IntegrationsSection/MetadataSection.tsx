"use client";

import { useSettings } from "@hooks/api/queries/useSettings";

import { emptyPanel, sectionGrid } from "../../styles";
import { ArtworkCard } from "./ArtworkCard";
import { EnrichmentSingleFieldCard } from "./EnrichmentSingleFieldCard";

export function MetadataSection() {
  const { data, isLoading, error } = useSettings();

  if (isLoading) {
    return (
      <div className={emptyPanel()}>
        <span className="text-fg/60 text-sm">Loading…</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={emptyPanel()}>
        <span className="text-sm text-red-400">Failed to load settings.</span>
      </div>
    );
  }

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
