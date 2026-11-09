"use client";

import { FilterSortDropdown } from "@components/ui/FilterSortDropdown";
import { useLibraryCounts } from "@hooks/api";
import { Library } from "lucide-react";
import { useTranslation } from "react-i18next";

import { LIBRARY_VIEWS, VIEW_CONFIG } from "../../constants";
import { viewCountFor } from "../../helpers";
import type { LibraryView } from "../../types";
import type { LibraryFilterSortMenuProps } from "./types";

export function LibraryFilterSortMenu({ controller, onViewChange }: LibraryFilterSortMenuProps) {
  const { t } = useTranslation("library");
  const { data: counts } = useLibraryCounts();
  const { config, view, sort, effectiveDirection } = controller;

  const viewOptions = LIBRARY_VIEWS.map((value) => ({
    value,
    label: t(VIEW_CONFIG[value].labelKey),
    icon: VIEW_CONFIG[value].icon,
    count: viewCountFor(value, counts),
  }));

  const sortOptions = config.sortOptions.map((option) => ({
    value: option.value,
    label: t(option.labelKey),
  }));

  return (
    <FilterSortDropdown<LibraryView, string>
      dataCy="library-filter-sort-trigger"
      triggerIcon={Library}
      filter={{
        value: view,
        onChange: onViewChange,
        options: viewOptions,
        sectionLabel: t("page.tabs.label"),
        sectionIcon: config.icon,
      }}
      sort={{
        value: sort,
        onChange: controller.setSort,
        options: sortOptions,
        sectionLabel: t("page.toolbar.sort"),
      }}
      direction={{ value: effectiveDirection, onChange: controller.setDir }}
    />
  );
}
