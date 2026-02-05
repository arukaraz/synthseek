"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { SortDirection } from "../../types";

interface SortDirectionButtonProps {
  direction: SortDirection;
  onToggle: () => void;
}

export function SortDirectionButton({ direction, onToggle }: SortDirectionButtonProps) {
  return (
    <button
      onClick={onToggle}
      className="text-fg/40 hover:bg-fg/10 hover:text-fg/80 rounded-lg p-1.5 transition-colors"
      title={direction === "asc" ? "Ascending" : "Descending"}
      aria-label={`Sort ${direction === "asc" ? "ascending" : "descending"}`}
    >
      {direction === "asc" ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />}
    </button>
  );
}
