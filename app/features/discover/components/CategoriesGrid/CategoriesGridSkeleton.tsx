import { gradientOverlay } from "@theme/utilities/styles";
import { cn } from "@utils/cn";

import { WidgetHeaderSkeleton } from "../WidgetHeader";
import { glassPanelCard } from "../styles";
import { SIZE_PATTERN } from "./constants";
import { panelBody, skeletonMosaic } from "./styles";

export function CategoriesGridSkeleton() {
  return (
    <div className={glassPanelCard({ width: "full" })} aria-label="Genres">
      <div className={gradientOverlay({ direction: "linearToR", intensity: "subtle" })} />

      <div className={panelBody()}>
        <WidgetHeaderSkeleton />
        <div className={skeletonMosaic()}>
          {SIZE_PATTERN.map((size, i) => (
            <div
              key={i}
              className={cn(
                "bg-fg/5 animate-pulse rounded-lg",
                size === "medium" && "row-span-2",
                size === "small" && "row-span-1"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
