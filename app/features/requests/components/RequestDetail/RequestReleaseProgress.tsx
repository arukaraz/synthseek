"use client";

import { useRequestReleases } from "@hooks/api/queries/useActiveReleases";

import { ReleaseProgressCard } from "./ReleaseProgressCard";
import { releaseStack } from "./styles";
import type { RequestReleaseProgressProps } from "./types";

export function RequestReleaseProgress({ tracks }: RequestReleaseProgressProps) {
  const releases = useRequestReleases(tracks.map((track) => track.id));
  if (releases.length === 0) return null;

  return (
    <div className={releaseStack()}>
      {releases.map((release) => (
        <ReleaseProgressCard key={`${release.userId}:${release.source}:${release.releaseKey}`} release={release} />
      ))}
    </div>
  );
}
