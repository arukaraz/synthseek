"use client";

import type { FilterSortFilterOption, FilterSortSortOption } from "@components/ui/FilterSortDropdown";
import { FilterSortDropdown } from "@components/ui/FilterSortDropdown";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

import { FILTER_ICONS, FILTER_VALUES, SORT_VALUES } from "../constants";
import { searchBox, searchInput, toolbar } from "../styles";
import type { LibraryFilter, LibrarySort } from "../types";

import { AutoWatchToggles } from "./AutoWatchToggles";
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
  autoWatch,
  onWatchChange,
}: ModalToolbarProps) {
  const { t } = useTranslation("library");

  const filterOptions: ReadonlyArray<FilterSortFilterOption<LibraryFilter>> = FILTER_VALUES.map((value) => ({
    value,
    label: t(`spotifyLibrary.filter.${value}`),
    icon: FILTER_ICONS[value],
  }));

  const sortOptions: ReadonlyArray<FilterSortSortOption<LibrarySort>> = SORT_VALUES.map((value) => ({
    value,
    label: t(`spotifyLibrary.sort.${value}`),
  }));

  return (
    <div className={toolbar()}>
      <FilterSortDropdown
        triggerClassName="shrink-0"
        filter={{ value: filter, onChange: onFilterChange, options: filterOptions }}
        sort={{ value: sort, onChange: onSortChange, options: sortOptions }}
        direction={{ value: direction, onChange: onDirectionChange }}
      />
      <div className={searchBox()}>
        <Search className="text-fg/40 absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2" />
        <input
          type="search"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t("spotifyLibrary.toolbar.searchPlaceholder")}
          className={searchInput()}
        />
      </div>
      <AutoWatchToggles value={autoWatch} onChange={onWatchChange} />
    </div>
  );
}
