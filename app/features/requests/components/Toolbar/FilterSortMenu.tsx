"use client";

import { FilterSortDropdown } from "@components/ui/FilterSortDropdown";
import { useUrlParam, useUrlParams } from "@hooks/ui/useUrlParam";
import { useTranslation } from "react-i18next";
import { REQUESTS_URL_PARAMS, SORT_FIELD_VALUES } from "../../types";
import { STATUS_FILTER_ICONS } from "./consts";
import { SourceFilter } from "./SourceFilter";

export function FilterSortMenu() {
  const { t } = useTranslation("requests");
  const [view] = useUrlParam("view", REQUESTS_URL_PARAMS.view);
  const { values, set } = useUrlParams({
    filter: REQUESTS_URL_PARAMS.filter,
    sort: REQUESTS_URL_PARAMS.sort,
    dir: REQUESTS_URL_PARAMS.dir,
  });

  const isList = view === "list";

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
      sort={
        isList
          ? undefined
          : {
              value: values.sort,
              onChange: (v) => set("sort", v),
              options: sortOptions,
            }
      }
      direction={isList ? undefined : { value: values.dir, onChange: (v) => set("dir", v) }}
    >
      {isList ? <SourceFilter /> : null}
    </FilterSortDropdown>
  );
}
