"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

import { scrollEdge, scrollEdgeButton } from "./styles";
import type { ScrollEdgeProps } from "./types";

export function ScrollEdge({ side, visible, shade = false, label, onClick }: ScrollEdgeProps) {
  const Icon = side === "left" ? ChevronLeft : ChevronRight;

  return (
    <div className={scrollEdge({ side, shade, visible })}>
      <button type="button" onClick={onClick} className={scrollEdgeButton()} aria-label={label}>
        <Icon className="size-4" />
      </button>
    </div>
  );
}
