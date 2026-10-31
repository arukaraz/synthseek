"use client";

import { useTranslation } from "react-i18next";

import { HISTORY_MIX_LAYOUTS } from "../HistoryMixes/constants";
import { PlaySetCard } from "../PlaySetCard/PlaySetCard";
import { coversOf, mixItemOf } from "./helpers";
import type { WidgetBlockProps } from "./types";

export function MixBlock({ items, size, accent, controls, heading }: WidgetBlockProps) {
  const { t } = useTranslation("discover");
  const { coverAction } = controls(mixItemOf(items, heading.name));

  return (
    <PlaySetCard
      accent={accent}
      icon={heading.icon}
      tag={t("customWidget.mix")}
      title={heading.name}
      blurb={heading.description.length > 0 ? heading.description : null}
      footnote={t("mixes.trackCount", { count: items.length })}
      covers={coversOf(items)}
      seed={heading.name}
      playLabel={t("history.play", { name: heading.name })}
      onPlay={coverAction?.kind === "play" ? coverAction.onClick : null}
      layout={HISTORY_MIX_LAYOUTS[size]}
    />
  );
}
