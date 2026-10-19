"use client";

import { useTranslation } from "react-i18next";

import { glassPanelCard } from "@components/ui/styles";
import { WidgetHeaderSkeleton } from "@components/WidgetHeader";

import { SKELETON_PLACEHOLDERS } from "./constants";
import { rail, railWrap, skeletonNode, skeletonRow, timeline } from "./styles";
import type { RecentScrobblesSkeletonProps } from "./types";

export function RecentScrobblesSkeleton({ layout }: RecentScrobblesSkeletonProps) {
  const { t } = useTranslation("discover");
  return (
    <section className={glassPanelCard({ height: "auto" })} aria-label={t("recentScrobbles.title")}>
      <WidgetHeaderSkeleton />
      {layout === "timeline" ? (
        <div className={timeline()}>
          {SKELETON_PLACEHOLDERS.map((i) => (
            <div key={i} className={skeletonRow()} />
          ))}
        </div>
      ) : (
        <div className={railWrap()}>
          <div className={rail()}>
            {SKELETON_PLACEHOLDERS.map((i) => (
              <div key={i} className={skeletonNode()} />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
