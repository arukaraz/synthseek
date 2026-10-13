"use client";

import { useTranslation } from "react-i18next";

import { InfoTooltip } from "@components/ui/InfoTooltip";
import { useDownloadSourceLabel } from "@hooks/ui/useDownloadSourceLabel";

import { trackSourceInfo } from "./styles";
import type { TrackSourceInfoProps } from "./types";

export function TrackSourceInfo({ provenance }: TrackSourceInfoProps) {
  const { t } = useTranslation("requests");
  const sourceLabel = useDownloadSourceLabel();

  return (
    <InfoTooltip
      trigger="click"
      side="bottom"
      triggerLabel={t("tracks.sourceInfo")}
      description={t("tracks.acquiredFrom", { source: sourceLabel(provenance.source) })}
      secondary={provenance.ref ?? undefined}
      learnMore={provenance.license !== null ? { label: t("tracks.license"), href: provenance.license } : undefined}
      className={trackSourceInfo()}
    />
  );
}
