"use client";

import { LayoutGrid, Music, Plug, RotateCw, SlidersHorizontal } from "lucide-react";
import { useTranslation } from "react-i18next";

import { Button } from "@components/ui/Button";
import { FilterSortDropdown } from "@components/ui/FilterSortDropdown";

import { BOARD_CATEGORY_KEYS, BOARD_CATEGORY_ORDER } from "../ExploreBoard/constants";
import { GALLERY_BOARD_FILTERS, GALLERY_CATEGORY_ICONS, GALLERY_SORTS } from "./constants";
import { isBoardFilter, sourceFilterOf, sourceFilterLabel } from "./helpers";
import { SourcePills } from "./SourcePills";
import { SourceReason } from "./SourceReason";
import { sourceStatusRetry, sourceTooltip } from "./styles";
import type { GalleryCategoryFilter, GalleryFilterMenuProps, GallerySort } from "./types";

export function GalleryFilterMenu({ filters, counts, sources, totals, onChange }: GalleryFilterMenuProps) {
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
  const categoryLabel =
    filters.category === "all"
      ? t("widgets:gallery.filter.all")
      : t(BOARD_CATEGORY_KEYS[filters.category].title, { ns: "discover" });
  const triggerLabel = [
    categoryLabel,
    sourceFilterLabel(sources.rows, filters.source),
    filters.board === "all" ? null : boardLabels[filters.board],
    sortLabels[filters.sort],
  ]
    .filter((part) => part !== null)
    .join(" · ");
  const unknown = sources.rows.some((row) => row.status === "unknown");

  return (
    <FilterSortDropdown<GalleryCategoryFilter, GallerySort>
      triggerIcon={SlidersHorizontal}
      triggerLabel={triggerLabel}
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
          id: "source",
          label: t("widgets:gallery.sources.label"),
          icon: Plug,
          value: filters.source,
          onChange: (value) => {
            const source = sourceFilterOf(sources.rows, value);
            if (source !== null) onChange({ ...filters, source });
          },
          options: [
            { value: "all", label: t("widgets:gallery.sources.all"), count: totals.all },
            { value: "synthseek", label: t("widgets:gallery.sources.synthseek"), icon: Music, count: totals.synthseek },
            ...sources.rows.map((row) => {
              const active = row.status === "active";
              return {
                value: row.source,
                label: row.label,
                content: <SourcePills pills={row.pills} inactive={!active} />,
                count: active ? row.count : undefined,
                status: active
                  ? undefined
                  : t(
                      row.status === "unknown" ? "widgets:gallery.sources.unknown" : "widgets:gallery.sources.inactive"
                    ),
                tooltip:
                  row.reason === null ? undefined : (
                    <span className={sourceTooltip()}>
                      <SourceReason reason={row.reason} />
                    </span>
                  ),
              };
            }),
          ],
          footer: unknown ? (
            <Button variant="ghost" size="sm" className={sourceStatusRetry()} onClick={sources.retry}>
              <RotateCw />
              {t("widgets:gallery.sources.retry")}
            </Button>
          ) : undefined,
        },
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
