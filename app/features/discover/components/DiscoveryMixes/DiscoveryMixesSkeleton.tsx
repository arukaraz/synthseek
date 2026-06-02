"use client";

import { WidgetHeaderSkeleton } from "../WidgetHeader";
import { glassPanelCard } from "../styles";
import { SKELETON_PLACEHOLDERS } from "./constants";
import { mixGrid, skeletonCard } from "./styles";

export function DiscoveryMixesSkeleton() {
  return (
    <section className={glassPanelCard({ height: "auto" })} aria-label="Discover Mixes">
      <WidgetHeaderSkeleton />
      <div className={mixGrid()}>
        {SKELETON_PLACEHOLDERS.map((index) => (
          <div key={index} className={skeletonCard()} />
        ))}
      </div>
    </section>
  );
}
