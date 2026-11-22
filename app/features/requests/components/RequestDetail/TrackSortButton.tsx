"use client";

import { ArrowDown, ArrowUp } from "lucide-react";

import { sortHeaderButton } from "./styles";
import type { TrackSortButtonProps } from "./types";

export function TrackSortButton({ label, sortKey, sort, onSort }: TrackSortButtonProps) {
  const direction = sort !== null && sort.key === sortKey ? sort.direction : null;
  const active = direction !== null;

  return (
    <button
      type="button"
      className={sortHeaderButton({ active })}
      onClick={() => onSort(sortKey)}
      aria-pressed={active}
      data-sort-active={active}
    >
      {label}
      {direction === "asc" ? <ArrowUp aria-hidden /> : null}
      {direction === "desc" ? <ArrowDown aria-hidden /> : null}
    </button>
  );
}
