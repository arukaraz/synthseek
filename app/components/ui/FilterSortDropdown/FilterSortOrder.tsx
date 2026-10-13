"use client";

import { ArrowDown, ArrowUp } from "lucide-react";
import { useTranslation } from "react-i18next";

import { filterSortOrderBtn, filterSortOrderRow } from "./styles";
import type { FilterSortOrderProps } from "./types";

export function FilterSortOrder({ value, onChange, spaced = false }: FilterSortOrderProps) {
  const { t } = useTranslation("components");

  return (
    <div className={filterSortOrderRow({ spaced })}>
      <button
        type="button"
        aria-pressed={value === "asc"}
        onClick={() => onChange("asc")}
        className={filterSortOrderBtn({ active: value === "asc" })}
      >
        <ArrowUp className="size-3" />
        {t("filterSort.ascending", { defaultValue: "Ascending" })}
      </button>
      <button
        type="button"
        aria-pressed={value === "desc"}
        onClick={() => onChange("desc")}
        className={filterSortOrderBtn({ active: value === "desc" })}
      >
        <ArrowDown className="size-3" />
        {t("filterSort.descending", { defaultValue: "Descending" })}
      </button>
    </div>
  );
}
