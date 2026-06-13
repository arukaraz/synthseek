"use client";

import { FilterSortDropdown } from "@components/ui/FilterSortDropdown";
import { useUrlParams } from "@hooks/ui/useUrlParam";
import { useTranslation } from "react-i18next";
import { REQUESTS_URL_PARAMS, SORT_FIELD_VALUES } from "../../types";
import { STATUS_FILTER_ICONS } from "./consts";

export function FilterSortMenu() {
  const { t } = useTranslation("requests");
  const { values, set } = useUrlParams({
    filter: REQUESTS_URL_PARAMS.filter,
    sort: REQUESTS_URL_PARAMS.sort,
    dir: REQUESTS_URL_PARAMS.dir,
  });

  const statusFilterOptions = STATUS_FILTER_ICONS.map((option) => ({
    ...option,
    label: t(`statusFilter.${option.value}`),
  }));
  const sortOptions = SORT_FIELD_VALUES.map((value) => ({ value, label: t(`sort.${value}`) }));

  return (
    <FilterSortDropdown
      dataCy="filter-sort-trigger"
      filter={{
        value: values.filter,
        onChange: (v) => set("filter", v),
        options: statusFilterOptions,
      }}
      sort={{
        value: values.sort,
        onChange: (v) => set("sort", v),
        options: sortOptions,
      }}
      direction={{ value: values.dir, onChange: (v) => set("dir", v) }}
    />
  );
}
