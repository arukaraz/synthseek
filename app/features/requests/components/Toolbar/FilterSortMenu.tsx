"use client";

import { FilterSortDropdown } from "@components/ui/FilterSortDropdown";
import { useDownloadSourcesAvailability } from "@hooks/api";
import { useDownloadSourceLabel } from "@hooks/ui/useDownloadSourceLabel";
import { useUrlParams } from "@hooks/ui/useUrlParam";
import { Download } from "lucide-react";
import { useTranslation } from "react-i18next";
import { isSourceFilter, isStatusFilter, sourceFilterKeys } from "../../helpers";
import { REQUESTS_URL_PARAMS, SORT_FIELD_VALUES } from "../../types";
import { STATUS_FILTER_ICONS } from "./constants";

export function FilterSortMenu() {
  const { t } = useTranslation("requests");
  const sourceLabel = useDownloadSourceLabel();
  const { data: availability } = useDownloadSourcesAvailability();
  const { values, set } = useUrlParams({
    filter: REQUESTS_URL_PARAMS.filter,
    source: REQUESTS_URL_PARAMS.source,
    sort: REQUESTS_URL_PARAMS.sort,
    dir: REQUESTS_URL_PARAMS.dir,
  });

  const statusFilterOptions = STATUS_FILTER_ICONS.map((option) => ({
    ...option,
    label: t(`statusFilter.${option.value}`),
  }));
  const sourceFilterOptions = [
    { value: "all", label: t("sourceFilter.all") },
    ...sourceFilterKeys(availability, values.source).map((key) => ({ value: key, label: sourceLabel(key) })),
  ];
  const sortOptions = SORT_FIELD_VALUES.map((value) => ({ value, label: t(`sort.${value}`) }));
  const triggerLabel = [
    t(`statusFilter.${values.filter}`),
    values.source === "all" ? null : sourceLabel(values.source),
    t(`sort.${values.sort}`),
  ]
    .filter((part) => part !== null)
    .join(" · ");

  return (
    <FilterSortDropdown
      dataCy="filter-sort-trigger"
      triggerLabel={triggerLabel}
      filterGroups={[
        {
          id: "status",
          label: t("filterGroup.status"),
          value: values.filter,
          onChange: (v) => {
            if (isStatusFilter(v)) set("filter", v);
          },
          options: statusFilterOptions,
        },
        {
          id: "source",
          label: t("filterGroup.source"),
          icon: Download,
          value: values.source,
          onChange: (v) => {
            if (isSourceFilter(v)) set("source", v);
          },
          options: sourceFilterOptions,
        },
      ]}
      sort={{
        value: values.sort,
        onChange: (v) => set("sort", v),
        options: sortOptions,
      }}
      direction={{ value: values.dir, onChange: (v) => set("dir", v) }}
    />
  );
}
