"use client";

import { X } from "lucide-react";
import { useTranslation } from "react-i18next";

import { toggleFilterValue } from "../../helpers";
import { facetValueLabel } from "../LibraryFilterSidebar/helpers";
import { shelfActiveChips } from "./helpers";
import { shelfActiveChip, shelfActiveChipX, shelfActiveClear, shelfActiveRow } from "./styles";
import type { ShelfActiveChipsProps } from "./types";

export function ShelfActiveChips({ controller, facets }: ShelfActiveChipsProps) {
  const { t } = useTranslation("library");
  const { t: tStatus } = useTranslation("status");
  const { t: tPlayer } = useTranslation("player");
  const { config, filters } = controller;
  const orphanActive = config.interactive && (filters.orphan ?? []).includes("true");
  const chips = shelfActiveChips(
    config.facets,
    filters,
    facets,
    (def, value, values) =>
      `${t(def.labelKey)}: ${facetValueLabel(def, value, values, tStatus, tPlayer("source.local"))}`
  );

  if (chips.length === 0 && !orphanActive) return null;

  return (
    <div className={shelfActiveRow()}>
      {orphanActive ? (
        <button
          type="button"
          className={shelfActiveChip()}
          onClick={() => controller.setOrphan(false)}
          aria-label={t("page.shelf.removeFilter", { label: t("page.facets.orphan") })}
        >
          {t("page.facets.orphan")}
          <span className={shelfActiveChipX()}>
            <X className="size-3" />
          </span>
        </button>
      ) : null}
      {chips.map((chip) => (
        <button
          key={`${chip.key}:${chip.value}`}
          type="button"
          className={shelfActiveChip()}
          onClick={() => controller.setFilterValues(chip.key, toggleFilterValue(filters[chip.key] ?? [], chip.value))}
          aria-label={t("page.shelf.removeFilter", { label: chip.label })}
        >
          {chip.label}
          <span className={shelfActiveChipX()}>
            <X className="size-3" />
          </span>
        </button>
      ))}
      <button type="button" className={shelfActiveClear()} onClick={controller.clearFilters}>
        {t("page.filters.clear")}
      </button>
    </div>
  );
}
