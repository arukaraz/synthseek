"use client";

import { ContentType } from "@api/__generated__/types";
import { cn } from "@utils/cn";
import type { FilterTabsProps, FilterType } from "./types";

const FILTER_TABS: Array<{ value: FilterType; label: string }> = [
  { value: "all", label: "All" },
  { value: ContentType.enum.playlist, label: "Playlists" },
  { value: ContentType.enum.artist, label: "Artists" },
  { value: ContentType.enum.album, label: "Albums" },
  { value: ContentType.enum.track, label: "Songs" },
];

export function FilterTabs({ activeFilter, onFilterChange, availableTypes }: FilterTabsProps) {
  const visibleTabs = availableTypes
    ? FILTER_TABS.filter((tab) => tab.value === "all" || availableTypes.has(tab.value))
    : FILTER_TABS;

  return (
    <div className="scrollbar-hide flex items-center gap-2 overflow-x-auto px-2">
      {visibleTabs.map((tab) => (
        <button
          key={tab.value}
          data-cy={`filter-tab-${tab.value}`}
          onClick={() => onFilterChange(tab.value)}
          className={cn(
            "shrink-0 rounded-full px-4 py-2.5 text-sm font-medium transition-all",
            activeFilter === tab.value ? "bg-fg text-surface" : "bg-fg/5 text-fg/70 hover:bg-fg/10 hover:text-fg"
          )}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
