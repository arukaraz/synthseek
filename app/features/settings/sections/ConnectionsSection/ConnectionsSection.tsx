"use client";

import { useSettings } from "@hooks/api/queries/useSettings";

import { SettingsPageHeader } from "../../components/SettingsPageHeader";
import { contentRoot, emptyPanel, sectionGrid } from "../../styles";
import { EnrichmentCard } from "./EnrichmentCard";
import { PlexCard } from "./PlexCard";
import { SlskdCard } from "./SlskdCard";

export function ConnectionsSection() {
  const { data, isLoading, error } = useSettings();

  if (isLoading) {
    return (
      <div className={contentRoot()}>
        <SettingsPageHeader title="Connections" />
        <div className={emptyPanel()}>
          <span className="text-fg/60 text-sm">Loading settings…</span>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={contentRoot()}>
        <SettingsPageHeader title="Connections" />
        <div className={emptyPanel()}>
          <span className="text-sm text-red-400">Failed to load settings: {error?.message ?? "Unknown error"}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={contentRoot()}>
      <SettingsPageHeader title="Connections" />
      <div className={sectionGrid()}>
        <SlskdCard initial={data.connections.slskd} />
        <PlexCard initial={data.connections.plex} />
        <EnrichmentCard initial={data.connections.enrichment} />
      </div>
    </div>
  );
}
