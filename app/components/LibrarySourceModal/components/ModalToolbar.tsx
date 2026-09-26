"use client";

import type { FilterSortFilterOption, FilterSortSortOption } from "@components/ui/FilterSortDropdown";
import { FilterSortDropdown } from "@components/ui/FilterSortDropdown";
import { Search } from "lucide-react";
import { useTranslation } from "react-i18next";

import { FILTER_ICONS, SORT_VALUES } from "../constants";
import { filterValuesFor, watchedKeys } from "../helpers";
import { searchBox, searchInput, toolbar } from "../styles";
import type { LibraryFilter, LibrarySort } from "../types";

import { AutoWatchToggles } from "./AutoWatchToggles";
import type { ModalToolbarProps } from "./types";

export function ModalToolbar({
  providerName,
  itemTypes,
  watch,
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

  const filterOptions: ReadonlyArray<FilterSortFilterOption<LibraryFilter>> = filterValuesFor(itemTypes).map(
    (value) => ({
      value,
      label: t(`librarySource.filter.${value}`),
      icon: FILTER_ICONS[value],
    })
  );

  const sortOptions: ReadonlyArray<FilterSortSortOption<LibrarySort>> = SORT_VALUES.map((value) => ({
    value,
    label: t(`librarySource.sort.${value}`),
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
          placeholder={t("librarySource.toolbar.searchPlaceholder")}
          className={searchInput()}
        />
      </div>
      {watchedKeys(watch).length > 0 ? (
        <AutoWatchToggles providerName={providerName} watch={watch} value={autoWatch} onChange={onWatchChange} />
      ) : null}
    </div>
  );
}
