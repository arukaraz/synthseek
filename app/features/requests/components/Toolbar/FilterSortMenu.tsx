"use client";

import { FilterSortDropdown } from "@components/ui/FilterSortDropdown";
import { useUrlParams } from "@hooks/ui/useUrlParam";
import { REQUESTS_URL_PARAMS, SortField, StatusFilter } from "../../types";
import { REQUESTS_SORT_OPTIONS, STATUS_FILTER_OPTIONS } from "./consts";

export function FilterSortMenu() {
  const { values, set } = useUrlParams({
    filter: REQUESTS_URL_PARAMS.filter,
    sort: REQUESTS_URL_PARAMS.sort,
    dir: REQUESTS_URL_PARAMS.dir,
  });

  return (
    <FilterSortDropdown
      dataCy="filter-sort-trigger"
      filter={{
        value: values.filter,
        onChange: (v) => set("filter", v as StatusFilter),
        options: STATUS_FILTER_OPTIONS,
      }}
      sort={{
        value: values.sort,
        onChange: (v) => set("sort", v as SortField),
        options: REQUESTS_SORT_OPTIONS,
      }}
      direction={{
        value: values.dir,
        onChange: (v) => set("dir", v),
      }}
    />
  );
}
