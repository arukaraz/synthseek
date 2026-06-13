"use client";

import { Checkbox } from "@components/ui/Checkbox";
import { useTranslation } from "react-i18next";

import { FacetGroup } from "./FacetGroup";
import { facetSearchTerm } from "./helpers";
import {
  clearButton,
  facetLabel,
  facetRow,
  group,
  groupLabel,
  sidebarHeader,
  sidebarShell,
  sidebarTitle,
} from "./styles";
import type { LibraryFilterSidebarProps } from "./types";

export function LibraryFilterSidebar({
  config,
  facets,
  filters,
  facetSearch,
  onToggleValue,
  onOrphanChange,
  onFacetSearch,
  onClear,
  hasActiveFilters,
}: LibraryFilterSidebarProps) {
  const { t } = useTranslation("library");
  const orphanActive = (filters.orphan ?? []).includes("true");

  return (
    <div className={sidebarShell()}>
      <div className={sidebarHeader()}>
        <p className={sidebarTitle()}>{t("page.filters.title")}</p>
        <button type="button" className={clearButton()} onClick={onClear} disabled={!hasActiveFilters}>
          {t("page.filters.clear")}
        </button>
      </div>

      {config.facets.map((def) => (
        <FacetGroup
          key={def.key}
          def={def}
          values={facets[def.key] ?? []}
          selected={filters[def.key] ?? []}
          searchTerm={facetSearchTerm(facetSearch, def.facetSearchKey)}
          onToggle={(value) => onToggleValue(def.key, value)}
          onSearch={(term) => (def.facetSearchKey ? onFacetSearch(def.facetSearchKey, term) : undefined)}
        />
      ))}

      {config.interactive ? (
        <div className={group()}>
          <p className={groupLabel()}>{t("page.facets.orphan")}</p>
          <label className={facetRow({ checked: orphanActive })}>
            <Checkbox checked={orphanActive} onCheckedChange={(value) => onOrphanChange(value === true)} />
            <span className={facetLabel()}>{t("page.facets.orphanOnly")}</span>
          </label>
        </div>
      ) : null}
    </div>
  );
}
