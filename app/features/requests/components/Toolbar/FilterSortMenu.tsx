"use client";

import { FilterSortDropdown } from "@components/ui/FilterSortDropdown";
import { useUrlParam, useUrlParams } from "@hooks/ui/useUrlParam";
import { REQUESTS_URL_PARAMS } from "../../types";
import { REQUESTS_SORT_OPTIONS, STATUS_FILTER_OPTIONS } from "./consts";
import { SourceFilter } from "./SourceFilter";

export function FilterSortMenu() {
  const [view] = useUrlParam("view", REQUESTS_URL_PARAMS.view);
  const { values, set } = useUrlParams({
    filter: REQUESTS_URL_PARAMS.filter,
    sort: REQUESTS_URL_PARAMS.sort,
    dir: REQUESTS_URL_PARAMS.dir,
  });

  const isList = view === "list";

  return (
    <FilterSortDropdown
      dataCy="filter-sort-trigger"
      filter={{
        value: values.filter,
        onChange: (v) => set("filter", v),
        options: STATUS_FILTER_OPTIONS,
      }}
      sort={
        isList
          ? undefined
          : {
              value: values.sort,
              onChange: (v) => set("sort", v),
              options: REQUESTS_SORT_OPTIONS,
            }
      }
      direction={isList ? undefined : { value: values.dir, onChange: (v) => set("dir", v) }}
    >
      {isList ? <SourceFilter /> : null}
    </FilterSortDropdown>
  );
}
