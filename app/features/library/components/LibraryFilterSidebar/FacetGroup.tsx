"use client";

import { Checkbox } from "@components/ui/Checkbox";
import { cn } from "@utils/cn";
import { useTranslation } from "react-i18next";

import { LIBRARY_FACET_TOP_N } from "../../constants";
import { topFacetValues } from "../../helpers";
import { FacetSearchInput } from "./FacetSearchInput";
import { staticFacetValues } from "./helpers";
import { facetCount, facetLabel, facetRow, group, groupEmpty, groupLabel, groupList, groupMore } from "./styles";
import type { FacetGroupProps } from "./types";

export function FacetGroup({ def, values, selected, searchTerm, onToggle, onSearch }: FacetGroupProps) {
  const { t } = useTranslation("library");
  const { t: tStatus } = useTranslation("status");
  const hasSearch = def.searchable && searchTerm.trim().length > 0;
  const visible = def.staticValues
    ? staticFacetValues(def.staticValues, values, tStatus)
    : def.searchable
      ? topFacetValues(values, LIBRARY_FACET_TOP_N, hasSearch)
      : values;
  const hiddenCount = def.staticValues ? 0 : values.length - visible.length;

  return (
    <div className={group()}>
      <p className={groupLabel()}>{t(def.labelKey)}</p>

      {def.searchable ? <FacetSearchInput value={searchTerm} label={t(def.labelKey)} onSearch={onSearch} /> : null}

      {visible.length === 0 ? (
        <p className={groupEmpty()}>{t("page.facets.noValues")}</p>
      ) : (
        <div className={groupList()}>
          {visible.map((value) => {
            const checked = selected.includes(value.value);
            return (
              <label key={value.value} className={facetRow({ checked })}>
                <Checkbox checked={checked} onCheckedChange={() => onToggle(value.value)} />
                <span className={cn(facetLabel())}>{value.label}</span>
                <span className={facetCount()}>{value.count.toLocaleString()}</span>
              </label>
            );
          })}
        </div>
      )}

      {def.searchable && !hasSearch && hiddenCount > 0 ? (
        <p className={groupMore()}>{t("page.facets.moreHint", { count: hiddenCount })}</p>
      ) : null}
    </div>
  );
}
