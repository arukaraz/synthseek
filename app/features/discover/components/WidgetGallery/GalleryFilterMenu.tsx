"use client";

import { LayoutGrid, SlidersHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";

import { FilterSortDropdown } from "@components/ui/FilterSortDropdown";

import { BOARD_CATEGORY_KEYS, BOARD_CATEGORY_ORDER } from "../ExploreBoard/constants";
import { GALLERY_BOARD_FILTERS, GALLERY_CATEGORY_ICONS, GALLERY_SORTS } from "./constants";
import { isBoardFilter } from "./helpers";
import type { GalleryCategoryFilter, GalleryFilterMenuProps, GallerySort } from "./types";

export function GalleryFilterMenu({ filters, counts, onChange }: GalleryFilterMenuProps) {
  const { t } = useTranslation(["widgets", "discover"]);
  const sortLabels: Record<GallerySort, string> = {
    suggested: t("widgets:gallery.filter.suggested"),
    name: t("widgets:gallery.filter.name"),
    category: t("widgets:gallery.filter.byCategory"),
    onBoardFirst: t("widgets:gallery.filter.onBoardFirst"),
  };
  const boardLabels = {
    all: t("widgets:gallery.filter.all"),
    on: t("widgets:gallery.filter.onBoard"),
    off: t("widgets:gallery.filter.offBoard"),
  };

  return (
    <FilterSortDropdown<GalleryCategoryFilter, GallerySort>
      triggerIcon={SlidersHorizontal}
      align="end"
      filter={{
        value: filters.category,
        onChange: (category) => onChange({ ...filters, category }),
        sectionLabel: t("widgets:gallery.filter.category"),
        options: [
          { value: "all", label: t("widgets:gallery.filter.all"), icon: LayoutGrid, count: counts.get("all") },
          ...BOARD_CATEGORY_ORDER.map((category) => ({
            value: category,
            label: t(BOARD_CATEGORY_KEYS[category].title, { ns: "discover" }),
            icon: GALLERY_CATEGORY_ICONS[category],
            count: counts.get(category),
          })),
        ],
      }}
      filterGroups={[
        {
          id: "board",
          label: t("widgets:gallery.filter.board"),
          value: filters.board,
          onChange: (board) => {
            if (isBoardFilter(board)) onChange({ ...filters, board });
          },
          options: GALLERY_BOARD_FILTERS.map((board) => ({ value: board, label: boardLabels[board] })),
        },
      ]}
      sort={{
        value: filters.sort,
        onChange: (sort) => onChange({ ...filters, sort }),
        sectionLabel: t("widgets:gallery.filter.sort"),
        options: GALLERY_SORTS.map((sort) => ({ value: sort, label: sortLabels[sort] })),
      }}
      direction={{ value: filters.direction, onChange: (direction) => onChange({ ...filters, direction }) }}
    />
  );
}
