"use client";

import { Input } from "@components/ui/Input";
import { useDebounce } from "@hooks/ui/useDebounce";
import { Search, SlidersHorizontal } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { LibraryFilterSortMenu } from "../LibraryFilterSortMenu";
import { controlButton, filtersBadge, searchBox, searchField, searchIcon, toolbarRow } from "./styles";
import type { LibraryToolbarProps } from "./types";

export function LibraryToolbar({
  controller,
  searchValue,
  searchPlaceholderKey,
  onSearchChange,
  onViewChange,
  onOpenFilters,
  activeFilterCount,
}: LibraryToolbarProps) {
  const { t } = useTranslation("library");
  const [input, setInput] = useState(searchValue);
  const debounced = useDebounce(input, { delay: 300 });

  useEffect(() => {
    setInput(searchValue);
  }, [searchValue]);

  useEffect(() => {
    if (debounced !== searchValue) {
      onSearchChange(debounced);
    }
  }, [debounced, searchValue, onSearchChange]);

  return (
    <div className={toolbarRow()}>
      <LibraryFilterSortMenu controller={controller} onViewChange={onViewChange} />

      <div className={searchBox()}>
        <Search className={searchIcon()} />
        <Input
          size="sm"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={t(searchPlaceholderKey)}
          className={searchField()}
          aria-label={t("page.toolbar.searchAria")}
        />
      </div>

      <button
        type="button"
        onClick={onOpenFilters}
        className={`${controlButton()} lg:hidden`}
        aria-label={t("page.toolbar.openFilters")}
      >
        <SlidersHorizontal className="size-4" />
        {activeFilterCount > 0 ? <span className={filtersBadge()}>{activeFilterCount}</span> : null}
      </button>
    </div>
  );
}
