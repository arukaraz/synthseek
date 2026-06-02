"use client";

import { WidgetHeaderSkeleton } from "../WidgetHeader";
import { glassPanelCard } from "../styles";
import { SKELETON_LIST_PLACEHOLDERS } from "./constants";
import { body, list, skeletonHero, skeletonRow } from "./styles";

export function TopTracksSkeleton() {
  return (
    <section className={glassPanelCard({ height: "auto" })} aria-label="Top Tracks">
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
