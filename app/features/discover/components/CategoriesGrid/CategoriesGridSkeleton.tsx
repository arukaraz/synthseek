"use client";

import { glassPanelCard } from "@components/ui/styles";
import { WidgetHeaderSkeleton } from "@components/WidgetHeader";
import { gradientOverlay } from "@theme/utilities/styles";
import { cn } from "@utils/cn";
import { useTranslation } from "react-i18next";

import { SIZE_PATTERN } from "./constants";
import { mosaicSlotClass } from "./helpers";
import { mosaicGrid, panelBody, skeletonCard } from "./styles";

export function CategoriesGridSkeleton() {
  const { t } = useTranslation("discover");

  return (
    <div className={glassPanelCard({ width: "full" })} aria-label={t("categories.grid.skeletonAriaLabel")}>
      <div className={gradientOverlay({ direction: "toR", intensity: "subtle" })} />

      <div className={panelBody()}>
        <WidgetHeaderSkeleton />
        <div className={mosaicGrid()}>
          {SIZE_PATTERN.map((size, i) => (
            <div key={i} className={cn(skeletonCard({ size }), mosaicSlotClass(i))} />
          ))}
        </div>
      </div>
    </div>
  );
}
