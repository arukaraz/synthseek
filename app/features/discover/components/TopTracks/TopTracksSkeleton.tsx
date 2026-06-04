"use client";

import { useTranslation } from "react-i18next";

import { WidgetHeaderSkeleton } from "../WidgetHeader";
import { glassPanelCard } from "../styles";
import { SKELETON_LIST_PLACEHOLDERS } from "./constants";
import { body, list, skeletonHero, skeletonRow } from "./styles";

export function TopTracksSkeleton() {
  const { t } = useTranslation("discover");
  return (
    <section className={glassPanelCard({ height: "auto" })} aria-label={t("topTracks.title")}>
      <WidgetHeaderSkeleton />
      <div className={body()}>
        <div className={skeletonHero()} />
        <div className={list()}>
          {SKELETON_LIST_PLACEHOLDERS.map((i) => (
            <div key={i} className={skeletonRow()} />
          ))}
        </div>
      </div>
    </section>
  );
}
