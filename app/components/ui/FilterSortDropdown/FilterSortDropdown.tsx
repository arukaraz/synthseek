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
import { ghostButton } from "@theme/utilities/styles";
import { cn } from "@utils/cn";
import { ArrowDown, ArrowUp, ChevronDown, Filter, SlidersHorizontal } from "lucide-react";

import { filterSortCount, filterSortOrderBtn, filterSortOrderRow, filterSortTriggerDefault } from "./styles";
import type { FilterSortDropdownProps } from "./types";

export function FilterSortDropdown<F extends string, S extends string = string>({
  filter,
  sort,
  direction,
  children,
  triggerIcon: TriggerIcon = SlidersHorizontal,
  triggerClassName,
  triggerLabel,
  triggerLabelClassName,
  align = "start",
  dataCy,
}: FilterSortDropdownProps<F, S>) {
  const FilterSectionIcon = filter.sectionIcon ?? Filter;
  const SortSectionIcon = sort?.sectionIcon ?? SlidersHorizontal;
  const activeFilterOption = filter.options.find((o) => o.value === filter.value);
  const activeSortOption = sort?.options.find((o) => o.value === sort.value);
  const label = triggerLabel ?? [activeFilterOption?.label, activeSortOption?.label].filter(Boolean).join(" · ");

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={cn(filterSortTriggerDefault(), triggerClassName)}
          aria-label="Filter and sort"
          data-cy={dataCy}
        >
          <TriggerIcon className="size-4" />
          <span className={cn("hidden sm:inline", triggerLabelClassName)}>{label}</span>
          {direction &&
            (direction.value === "asc" ? (
              <ArrowUp className="hidden size-3.5 opacity-60 sm:inline" />
            ) : (
              <ArrowDown className="hidden size-3.5 opacity-60 sm:inline" />
            ))}
          <ChevronDown className="size-3.5 opacity-50" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align={align} className="min-w-52">
        <DropdownMenuLabel className="flex items-center gap-2">
          <FilterSectionIcon className="size-3" />
          {filter.sectionLabel ?? "Filter"}
        </DropdownMenuLabel>
        <DropdownMenuRadioGroup value={filter.value} onValueChange={(v) => filter.onChange(v as F)}>
          {filter.options.map((option) => {
            const Icon = option.icon;
            return (
              <DropdownMenuRadioItem key={option.value} value={option.value}>
                {Icon && <Icon className="mr-2 size-3.5" />}
                <span className="flex-1">{option.label}</span>
                {option.count !== undefined && <span className={filterSortCount()}>{option.count}</span>}
              </DropdownMenuRadioItem>
            );
          })}
        </DropdownMenuRadioGroup>

        {sort && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel className="flex items-center gap-2">
              <SortSectionIcon className="size-3" />
              {sort.sectionLabel ?? "Sort by"}
            </DropdownMenuLabel>
            <DropdownMenuRadioGroup value={sort.value} onValueChange={(v) => sort.onChange(v as S)}>
              {sort.options.map((option) => (
                <DropdownMenuRadioItem key={option.value} value={option.value}>
                  {option.label}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </>
        )}

        {direction && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>Order</DropdownMenuLabel>
            <div className={filterSortOrderRow()}>
              <button
                type="button"
                aria-pressed={direction.value === "asc"}
                onClick={() => direction.onChange("asc")}
                className={filterSortOrderBtn({ active: direction.value === "asc" })}
              >
                <ArrowUp className="size-3" />
                Ascending
              </button>
              <button
                type="button"
                aria-pressed={direction.value === "desc"}
                onClick={() => direction.onChange("desc")}
                className={filterSortOrderBtn({ active: direction.value === "desc" })}
              >
                <ArrowDown className="size-3" />
                Descending
              </button>
            </div>
          </>
        )}

        {children && (
          <>
            <DropdownMenuSeparator />
            {children}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

FilterSortDropdown.defaultTriggerClassName = ghostButton({ size: "sm", hover: "default" });
