"use client";

import { cn } from "@utils/cn";
import type { OrderToggleProps } from "./types";

export function OrderToggle({ isActive, label, icon: Icon, onClick }: OrderToggleProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={isActive}
      className={cn(
        "flex flex-1 items-center justify-center gap-1.5 rounded-md border px-2 py-1.5 text-xs transition-colors",
        isActive
          ? "border-primary-500/40 bg-primary-500/15 text-primary-200"
          : "border-fg/10 bg-fg/5 text-fg/60 hover:bg-fg/10 hover:text-fg"
      )}
    >
      <Icon className="size-3" />
      {label}
    </button>
  );
}
