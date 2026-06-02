"use client";

import { WidgetHeaderSkeleton } from "../WidgetHeader";
import { glassPanelCard } from "../styles";
import { SKELETON_PLACEHOLDERS } from "./constants";
import { rail, railWrap, skeletonNode } from "./styles";

export function RecentScrobblesSkeleton() {
  return (
    <section className={glassPanelCard({ height: "auto" })} aria-label="Recent Scrobbles">
      <WidgetHeaderSkeleton />
      <div className={railWrap()}>
        <div className={rail()}>
          {SKELETON_PLACEHOLDERS.map((i) => (
            <div key={i} className={skeletonNode()} />
          ))}
        </div>
      </div>
    </section>
  );
}
