"use client";

import { glassPanelCard } from "@components/ui/styles";
import { WidgetHeaderSkeleton } from "@components/WidgetHeader";
import { gradientOverlay } from "@theme/utilities/styles";
import { useTranslation } from "react-i18next";

import { SIZE_PATTERN } from "./constants";
import { mosaicGrid, panelBody, skeletonCard } from "./styles";
import type { CategoriesGridSkeletonProps } from "./types";

export function CategoriesGridSkeleton({ layout }: CategoriesGridSkeletonProps) {
  const { t } = useTranslation("discover");

  return (
    <div className={glassPanelCard({ width: "full" })} aria-label={t("categories.grid.skeletonAriaLabel")}>
      <div className={gradientOverlay({ direction: "toR", intensity: "subtle" })} />

      <div className={panelBody()}>
        <WidgetHeaderSkeleton />
        <div className={mosaicGrid({ layout })}>
          {SIZE_PATTERN[layout].map((size, i) => (
            <div key={i} className={skeletonCard({ size })} />
          ))}
        </div>
      </div>
    </div>
  );
}
