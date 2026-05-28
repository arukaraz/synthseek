"use client";

import { FilterSortDropdown } from "@components/ui/FilterSortDropdown";
import { Search } from "lucide-react";

import { FILTER_OPTIONS, SORT_OPTIONS } from "../constants";
import { searchBox, searchInput, toolbar } from "../styles";
import type { ModalToolbarProps } from "./types";

export function ModalToolbar({
  filter,
  onFilterChange,
  sort,
  onSortChange,
  direction,
  onDirectionChange,
  search,
  onSearchChange,
}: ModalToolbarProps) {
  return (
    <div className={toolbar()}>
      <FilterSortDropdown
        filter={{ value: filter, onChange: onFilterChange, options: FILTER_OPTIONS }}
        sort={{ value: sort, onChange: onSortChange, options: SORT_OPTIONS }}
        direction={{ value: direction, onChange: onDirectionChange }}
      />
      <div className={searchBox()}>
        <Search className="text-fg/40 absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search items…"
          className={searchInput()}
        />
      </div>
    </div>
  );
}
