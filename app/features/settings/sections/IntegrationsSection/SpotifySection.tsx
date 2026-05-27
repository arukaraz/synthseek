"use client";

import { useSettings } from "@hooks/api/queries/useSettings";

import { emptyPanel, sectionGrid } from "../../styles";
import { SpotifyAppCard } from "./SpotifyAppCard";

export function SpotifySection() {
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
      <SpotifyAppCard initial={data.connections.spotify} />
    </div>
  );
}
