"use client";

import { useTranslation } from "react-i18next";

import { WidgetHeaderSkeleton } from "../WidgetHeader";
import { glassPanelCard } from "../styles";
import { SKELETON_PLACEHOLDERS } from "./constants";
import { mixGrid, skeletonCard } from "./styles";

export function DiscoveryMixesSkeleton() {
  const { t } = useTranslation("discover");
  return (
    <section className={glassPanelCard({ height: "auto" })} aria-label={t("mixes.title")}>
      <WidgetHeaderSkeleton />
      <div className={mixGrid()}>
        {SKELETON_PLACEHOLDERS.map((index) => (
          <div key={index} className={skeletonCard()} />
        ))}
      </div>
    </section>
  );
}
