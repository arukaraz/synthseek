"use client";

import { useTranslation } from "react-i18next";

import { useEntityPlayback } from "@hooks/ui/useEntityPlayback";

import { skeletonCard } from "../DiscoveryMixes/styles";
import { PlaySetCard } from "../PlaySetCard/PlaySetCard";
import { HISTORY_MIXES } from "./constants";
import type { HistoryMixProps } from "./types";

export function HistoryMix({ kind, query, info }: HistoryMixProps) {
  const { t } = useTranslation("discover");
  const { playEntity } = useEntityPlayback();
  const config = HISTORY_MIXES[kind];
  const title = t(config.titleKey);

  if (query.isLoading) return <div className={skeletonCard()} role="status" aria-label={title} />;

  const trackIds = query.data?.trackIds ?? [];
  const playable = !query.isError && trackIds.length > 0;
  const blurb = query.isError ? t("history.error") : playable ? t(config.blurbKey) : t(config.emptyKey);

  return (
    <PlaySetCard
      accent={config.accent}
      icon={config.icon}
      tag={t(config.tagKey)}
      title={title}
      blurb={blurb}
      footnote={playable ? t("mixes.trackCount", { count: trackIds.length }) : null}
      covers={query.data?.covers ?? []}
      seed={kind}
      info={info}
      playLabel={t("history.play", { name: title })}
      onPlay={playable ? () => void playEntity({ kind: "tracks", trackIds }) : null}
    />
  );
}
