"use client";

import { ArrowDown, ArrowUp, ListChecks, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { countActiveFilters } from "../../helpers";
import { SHELF_LAYOUTS } from "./constants";
import { ShelfSortSheet } from "./ShelfSortSheet";
import {
  shelfChip,
  shelfChipCount,
  shelfControlsRow,
  shelfLayoutButton,
  shelfLayoutSegment,
  shelfSelectToggle,
} from "./styles";
import type { ShelfControlsProps } from "./types";

export function ShelfControls({ controller, onOpenFilters, shell }: ShelfControlsProps) {
  const { t } = useTranslation("library");
  const [sortOpen, setSortOpen] = useState(false);
  const activeCount = countActiveFilters(controller.filters);
  const sortLabelKey = controller.config.sortOptions.find((option) => option.value === controller.sort)?.labelKey;
  const isGrid = controller.config.layout === "grid";
  const selectable = controller.view === "tracks" || controller.view === "albums";

  return (
    <div className={shelfControlsRow()}>
      <button
        type="button"
        className={shelfChip({ active: activeCount > 0 })}
        onClick={onOpenFilters}
        aria-label={t("page.toolbar.openFilters")}
      >
        <SlidersHorizontal className="size-4" />
        {t("page.toolbar.openFilters")}
        {activeCount > 0 ? <span className={shelfChipCount()}>{activeCount}</span> : null}
      </button>
      <button
        type="button"
        className={shelfChip()}
        onClick={() => setSortOpen(true)}
        aria-label={t("page.toolbar.sortAria")}
      >
        {controller.effectiveDirection === "asc" ? <ArrowUp className="size-4" /> : <ArrowDown className="size-4" />}
        {sortLabelKey ? t(sortLabelKey) : t("page.toolbar.sort")}
      </button>
      <span className="flex-1" />
      {isGrid ? (
        <div className={shelfLayoutSegment()} role="radiogroup" aria-label={t("page.shelf.density")}>
          {SHELF_LAYOUTS.map(({ value, Icon }) => (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={shell.density === value}
              aria-label={t(`page.shelf.${value}`)}
              className={shelfLayoutButton({ active: shell.density === value })}
              onClick={() => shell.onDensityChange(value)}
            >
              <Icon className="size-5" />
            </button>
          ))}
        </div>
      ) : null}
      {selectable ? (
        <button
          type="button"
          className={shelfSelectToggle({ active: shell.selectMode })}
          aria-pressed={shell.selectMode}
          aria-label={t("page.shelf.selectMode")}
          onClick={() => shell.onSelectModeChange(!shell.selectMode)}
        >
          <ListChecks className="size-5" />
        </button>
      ) : null}
      <ShelfSortSheet controller={controller} open={sortOpen} onOpenChange={setSortOpen} />
    </div>
  );
}
