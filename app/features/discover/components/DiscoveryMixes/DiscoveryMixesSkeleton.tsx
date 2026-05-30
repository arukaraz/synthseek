"use client";

import { Library } from "lucide-react";

import { glassPanelCard } from "../styles";
import { SKELETON_PLACEHOLDERS } from "./constants";
import { mixGrid, skeletonCard, widgetHeader, widgetIcon, widgetSubtitle, widgetTitle } from "./styles";

export function DiscoveryMixesSkeleton() {
  return (
    <section className={glassPanelCard({ height: "auto" })}>
      <header className={widgetHeader()}>
        <span className={widgetIcon()}>
          <Library className="size-4" />
        </span>
        <div>
          <h2 className={widgetTitle()}>Discover Mixes</h2>
          <p className={widgetSubtitle()}>ListenBrainz</p>
        </div>
      </header>
      <div className={mixGrid()}>
        {SKELETON_PLACEHOLDERS.map((index) => (
          <div key={index} className={skeletonCard()} />
        ))}
      </div>
    </section>
  );
}
