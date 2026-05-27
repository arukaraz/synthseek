import { gradientOverlay } from "@theme/utilities/styles";
import { cn } from "@utils/cn";
import { glassPanelCard } from "../styles";
import { SIZE_PATTERN } from "./constants";

export function CategoriesGridSkeleton() {
  return (
    <div className={glassPanelCard()}>
      <div className={gradientOverlay({ direction: "linearToR", intensity: "subtle" })} />

      <div className="relative flex flex-1 flex-col">
        <div className="mb-4 flex items-center justify-between">
          <div className="space-y-2">
            <div className="bg-fg/10 h-5 w-20 animate-pulse rounded" />
            <div className="bg-fg/10 h-3 w-32 animate-pulse rounded" />
          </div>
          <div className="bg-fg/10 h-4 w-14 animate-pulse rounded" />
        </div>
        <div className="grid grid-flow-dense auto-rows-[100px] grid-cols-2 gap-3">
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
