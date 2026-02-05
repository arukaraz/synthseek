"use client";

import { cn } from "@utils/cn";
import { Grid3X3, List } from "lucide-react";
import { ViewMode } from "../../types";

interface ViewToggleProps {
  viewMode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

export function ViewToggle({ viewMode, onChange }: ViewToggleProps) {
  return (
    <div className="bg-fg/5 flex items-center gap-0.5 rounded-md p-0.5">
      <button
        onClick={() => onChange("compact")}
        className={cn(
          "rounded p-1.5 transition-colors",
          viewMode === "compact" ? "bg-fg/10 text-fg" : "text-fg/40 hover:text-fg/60"
        )}
        title="Grid view"
        aria-label="Switch to grid view"
      >
        <Grid3X3 className="size-4" />
      </button>
      <button
        onClick={() => onChange("list")}
        className={cn(
          "rounded p-1.5 transition-colors",
          viewMode === "list" ? "bg-fg/10 text-fg" : "text-fg/40 hover:text-fg/60"
        )}
        title="List view"
        aria-label="Switch to list view"
      >
        <List className="size-4" />
      </button>
    </div>
  );
}
