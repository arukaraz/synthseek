"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@components/ui/DropdownMenu";
import { useUrlParams } from "@hooks/ui/useUrlParam";
import { titleCase } from "@utils/formatters";
import { ghostButton } from "@theme/utilities/styles";
import { ArrowDown, ArrowUp, ChevronDown, Filter, SlidersHorizontal } from "lucide-react";
import { REQUESTS_URL_PARAMS, SORT_FIELD_VALUES, SortField, StatusFilter } from "../../types";
import { OrderToggle } from "./OrderToggle";
import { STATUS_FILTER_OPTIONS } from "./consts";

export function FilterSortMenu() {
  const { values, set } = useUrlParams({
    filter: REQUESTS_URL_PARAMS.filter,
    sort: REQUESTS_URL_PARAMS.sort,
    dir: REQUESTS_URL_PARAMS.dir,
  });

  const currentStatus = STATUS_FILTER_OPTIONS.find((o) => o.value === values.filter);
  const triggerLabel = `${currentStatus?.label ?? "All"} · ${titleCase(values.sort)}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={ghostButton({ size: "sm", hover: "default" })}
          aria-label="Filter and sort requests"
          data-cy="filter-sort-trigger"
        >
          <SlidersHorizontal className="size-3.5 sm:size-3" />
          <span className="hidden sm:inline">{triggerLabel}</span>
          {values.dir === "asc" ? (
            <ArrowUp className="hidden size-3 opacity-60 sm:inline" />
          ) : (
            <ArrowDown className="hidden size-3 opacity-60 sm:inline" />
          )}
          <ChevronDown className="size-3 opacity-50" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="min-w-52">
        <DropdownMenuLabel className="flex items-center gap-2">
          <Filter className="size-3" />
          Filter
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup value={values.filter} onValueChange={(v) => set("filter", v as StatusFilter)}>
          {STATUS_FILTER_OPTIONS.map((option) => {
            const Icon = option.icon;
            return (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                <Icon className="mr-2 size-3.5" />
                {option.label}
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />

        <DropdownMenuLabel className="flex items-center gap-2">
          <SlidersHorizontal className="size-3" />
          Sort by
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup value={values.sort} onValueChange={(v) => set("sort", v as SortField)}>
          {SORT_FIELD_VALUES.map((field) => (
            <DropdownMenuRadioItem key={field} value={field}>
              {titleCase(field)}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>

        <DropdownMenuSeparator />

        <DropdownMenuLabel>Order</DropdownMenuLabel>
        <div className="flex gap-1 px-2 pb-2">
          <OrderToggle
            isActive={values.dir === "asc"}
            label="Ascending"
            icon={ArrowUp}
            onClick={() => set("dir", "asc")}
          />
          <OrderToggle
            isActive={values.dir === "desc"}
            label="Descending"
            icon={ArrowDown}
            onClick={() => set("dir", "desc")}
          />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
