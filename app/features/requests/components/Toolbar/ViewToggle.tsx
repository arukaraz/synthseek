"use client";

import { useUrlParam } from "@hooks/ui/useUrlParam";
import { cn } from "@utils/cn";
import { List, PanelLeft } from "lucide-react";
import { REQUESTS_URL_PARAMS } from "../../types";

export function ViewToggle() {
  const [viewMode, setView] = useUrlParam("view", REQUESTS_URL_PARAMS.view);

  return (
    <div className="bg-fg/5 flex items-center gap-0.5 rounded-md p-0.5">
      <button
        onClick={() => setView("groups")}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded transition-colors",
          viewMode === "groups" ? "bg-fg/10 text-fg" : "text-fg/40 hover:text-fg/60"
        )}
        title="Groups view"
        aria-label="Switch to groups view"
      >
        <PanelLeft className="size-4" />
      </button>
      <button
        onClick={() => setView("list")}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded transition-colors",
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
