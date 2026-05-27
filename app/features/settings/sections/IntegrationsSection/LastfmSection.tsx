"use client";

import { useSettings } from "@hooks/api/queries/useSettings";

import { emptyPanel, sectionGrid } from "../../styles";
import { EnrichmentSingleFieldCard } from "./EnrichmentSingleFieldCard";

export function LastfmSection() {
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
      <EnrichmentSingleFieldCard
        initial={data.connections.enrichment}
        field="lastfmApiKey"
        title="Last.fm"
        optional
        description="Powers similar-artists, global trending charts, and genre tag lookups used by discovery and smart search. Falls back to empty results silently if unset."
        fieldLabel="API key"
      />
    </div>
  );
}
