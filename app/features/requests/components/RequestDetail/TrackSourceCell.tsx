"use client";

import { Scale } from "lucide-react";
import { useTranslation } from "react-i18next";

import { useTrackRelease } from "@hooks/api/queries/useActiveReleases";
import { useDownloadSourceLabel } from "@hooks/ui/useDownloadSourceLabel";

import { trackProvenance } from "./helpers";
import { trackSource, trackSourceEmpty, trackSourceLabel, trackSourceLicense } from "./styles";
import type { TrackSourceCellProps } from "./types";

export function TrackSourceCell({ track }: TrackSourceCellProps) {
  const { t } = useTranslation("requests");
  const sourceLabel = useDownloadSourceLabel();
  const provenance = trackProvenance(track, useTrackRelease(track.id));

  if (provenance === null) return <span className={trackSourceEmpty()}>-</span>;

  return (
    <span className={trackSource()}>
      <span className={trackSourceLabel()} title={provenance.ref ?? undefined}>
        {sourceLabel(provenance.source)}
      </span>
      {provenance.license !== null ? (
        <a
          href={provenance.license}
          target="_blank"
          rel="noopener noreferrer"
          className={trackSourceLicense()}
          aria-label={t("tracks.license")}
          title={t("tracks.license")}
        >
          <Scale className="size-3.5" aria-hidden="true" />
        </a>
      ) : null}
    </span>
  );
}
