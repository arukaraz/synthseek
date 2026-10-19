"use client";

import { useTranslation } from "react-i18next";

import { glassPanelCard } from "@components/ui/styles";
import { WidgetHeaderSkeleton } from "@components/WidgetHeader";

import { SKELETON_LIST_PLACEHOLDERS } from "./constants";
import { body, bodyFrame, list, skeletonHero, skeletonRow } from "./styles";
import type { TopTracksSkeletonProps } from "./types";

export function TopTracksSkeleton({ shape }: TopTracksSkeletonProps) {
  const { t } = useTranslation("discover");
  return (
    <section className={glassPanelCard({ height: "auto" })} aria-label={t("topTracks.title")}>
      <WidgetHeaderSkeleton />
      <div className={bodyFrame()}>
        <div className={body({ shape })}>
          <div className={skeletonHero({ shape })} />
          <div className={list()}>
            {SKELETON_LIST_PLACEHOLDERS.map((i) => (
              <div key={i} className={skeletonRow()} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
