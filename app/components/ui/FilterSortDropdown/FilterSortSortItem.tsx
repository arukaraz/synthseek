"use client";

import { AdminOnlyMark } from "@components/ui/AdminOnlyMark";
import { DropdownMenuRadioItem } from "@components/ui/DropdownMenu";

import type { FilterSortSortItemProps } from "./types";

export function FilterSortSortItem({ option }: FilterSortSortItemProps) {
  return (
    <DropdownMenuRadioItem value={option.value}>
      <span className="flex-1">{option.label}</span>
      {option.adminOnly ? <AdminOnlyMark className="ml-2" /> : null}
    </DropdownMenuRadioItem>
  );
}
