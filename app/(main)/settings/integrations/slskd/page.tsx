"use client";

import { useSettings } from "@hooks/api/queries/useSettings";
import { SlskdCard } from "@features/settings/sections/IntegrationsSection/SlskdCard";
import { emptyPanel, sectionGrid } from "@features/settings/styles";

export default function SlskdIntegrationPage() {
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
        <span className="text-sm text-red-400">Failed to load settings: {error?.message ?? "Unknown error"}</span>
      </div>
    );
  }

  return (
    <div className={sectionGrid()}>
      <SlskdCard initial={data.connections.slskd} />
    </div>
  );
}
