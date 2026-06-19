"use client";

import { FilterSortDropdown } from "@components/ui/FilterSortDropdown";
import { ArrowDownUp } from "lucide-react";
import { useTranslation } from "react-i18next";

import { SORT_KEYS } from "./constants";
import { isTracklistSortKey } from "./helpers";
import type { TracklistSortProps } from "./types";

export function TracklistSort({ sortKey, direction, onSortKeyChange, onDirectionChange }: TracklistSortProps) {
  const { t } = useTranslation("contentDetail");

  const sortOptions = SORT_KEYS.map((key) => ({ value: key, label: t(`sort.${key}`) }));

  return (
    <FilterSortDropdown
      align="end"
      triggerIcon={ArrowDownUp}
      triggerLabel={t(`sort.${sortKey}`)}
      sort={{
        value: sortKey,
        onChange: (value) => {
          if (isTracklistSortKey(value)) onSortKeyChange(value);
        },
        options: sortOptions,
        sectionLabel: t("sort.label"),
      }}
      direction={{ value: direction, onChange: onDirectionChange }}
    />
  );
}
